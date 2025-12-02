import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/middleware/auth';
import { calculateDuration } from '@/utils/dateUtils';
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

    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Location is required' },
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
        { error: 'No active attendance found' },
        { status: 400 }
      );
    }

    // Find active lunch break
    const activeLunchBreak = attendance.lunchBreaks.find(
      (lb) => !lb.lunchEndTime
    );

    if (!activeLunchBreak) {
      return NextResponse.json(
        { error: 'No active lunch break found' },
        { status: 400 }
      );
    }

    // Calculate duration
    const duration = calculateDuration(
      new Date(activeLunchBreak.lunchStartTime),
      now
    );

    // Update lunch break
    const updatedLunchBreak = await prisma.lunchBreak.update({
      where: { id: activeLunchBreak.id },
      data: {
        lunchEndTime: now,
        lunchEndLat: latitude,
        lunchEndLng: longitude,
        duration,
      },
    });

    return NextResponse.json({
      success: true,
      lunchBreak: updatedLunchBreak,
    });
  } catch (error) {
    console.error('Lunch end error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

