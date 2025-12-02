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
        { error: 'Please punch in first' },
        { status: 400 }
      );
    }

    // Check if there's already an active lunch break
    const activeLunchBreak = attendance.lunchBreaks.find(
      (lb) => !lb.lunchEndTime
    );

    if (activeLunchBreak) {
      return NextResponse.json(
        { error: 'Lunch break already started' },
        { status: 400 }
      );
    }

    // Create lunch break
    const lunchBreak = await prisma.lunchBreak.create({
      data: {
        userId,
        attendanceRecordId: attendance.id,
        lunchStartTime: now,
        lunchStartLat: latitude,
        lunchStartLng: longitude,
      },
    });

    return NextResponse.json({
      success: true,
      lunchBreak,
    });
  } catch (error) {
    console.error('Lunch start error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

