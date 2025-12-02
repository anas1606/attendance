import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/middleware/auth';
import { getNowIST, getTodayIST } from '@/utils/timezone';

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { latitude, longitude, workDone } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    if (!workDone || workDone.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a valid work summary (minimum 10 characters)' },
        { status: 400 }
      );
    }

    const userId = authResult.user.userId;
    const now = getNowIST(); // Use IST time
    const todayDateIST = getTodayIST(); // Get today's date in IST

    // Find today's attendance record
    const attendance = await prisma.attendanceRecord.findFirst({
      where: {
        userId,
        date: todayDateIST,
        punchOutTime: null,
      },
      include: {
        lunchBreaks: true,
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { error: 'No active punch-in found for today' },
        { status: 400 }
      );
    }

    // Check if there's an active lunch break
    const activeLunchBreak = attendance.lunchBreaks.find(
      (lb) => !lb.lunchEndTime
    );

    if (activeLunchBreak) {
      return NextResponse.json(
        { error: 'Please end lunch break before punching out' },
        { status: 400 }
      );
    }

    // Calculate total working hours (excluding lunch breaks)
    const totalLunchMinutes = attendance.lunchBreaks.reduce(
      (total, lb) => total + (lb.duration || 0),
      0
    );

    const totalMinutes =
      (now.getTime() - new Date(attendance.punchInTime).getTime()) /
      (1000 * 60);
    const workingMinutes = totalMinutes - totalLunchMinutes;
    const workingHours = parseFloat((workingMinutes / 60).toFixed(2));

    // Update attendance record
    const updatedAttendance = await prisma.attendanceRecord.update({
      where: { id: attendance.id },
      data: {
        punchOutTime: now,
        punchOutLat: latitude,
        punchOutLng: longitude,
        workingHours,
        workDone: workDone.trim(),
      },
      include: {
        lunchBreaks: true,
      },
    });

    return NextResponse.json({
      success: true,
      attendance: updatedAttendance,
    });
  } catch (error) {
    console.error('Punch out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

