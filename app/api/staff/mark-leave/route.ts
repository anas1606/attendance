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

    const { reason } = await request.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Leave reason is required' },
        { status: 400 }
      );
    }

    const userId = authResult.user.userId;
    const now = getNowIST(); // Use IST time
    const todayDateIST = getTodayIST(); // Get today's date in IST

    // Check if already has a record for today
    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId,
        date: todayDateIST,
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        { error: 'You already have an attendance record for today. Cannot mark as leave.' },
        { status: 400 }
      );
    }

    // Create attendance record with leave status
    // We use a special marker: punchInTime is set but with workDone = "ON_LEAVE: reason"
    const attendance = await prisma.attendanceRecord.create({
      data: {
        userId,
        punchInTime: now,
        punchOutTime: now,
        workingHours: 0,
        workDone: `ON_LEAVE: ${reason.trim()}`,
        date: todayDateIST,
      },
    });

    return NextResponse.json({
      success: true,
      attendance,
      message: 'Marked as on leave for today',
    });
  } catch (error) {
    console.error('Mark leave error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

