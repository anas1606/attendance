import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/middleware/auth';
import { getNowIST, getTodayDateIST, getTodayIST } from '@/utils/timezone';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

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
    const todayDate = getTodayDateIST(); // Get today's date in IST
    const todayDateObj = getTodayIST(); // Date object for today in IST

    // Get staff profile to check working days
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { staffProfile: true },
    });

    if (!user || !user.staffProfile) {
      return NextResponse.json(
        { error: 'Staff profile not found' },
        { status: 404 }
      );
    }

    // Check if today is a working day (using IST)
    const todayDayName = DAY_NAMES[now.getDay()];
    const workingDays = JSON.parse(user.staffProfile.workingDays);

    if (!workingDays.includes(todayDayName)) {
      return NextResponse.json(
        { 
          error: `Today is ${todayDayName}. You can only punch in on your working days: ${workingDays.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Check if today is a holiday
    const holiday = await prisma.holiday.findFirst({
      where: { date: todayDateObj },
    });

    if (holiday) {
      return NextResponse.json(
        { 
          error: `Today is a holiday: ${holiday.name}. No attendance required.` 
        },
        { status: 400 }
      );
    }

    // Check if already punched in today
    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId,
        date: todayDateObj,
      },
    });

    if (existingRecord && !existingRecord.punchOutTime) {
      return NextResponse.json(
        { error: 'Already punched in today' },
        { status: 400 }
      );
    }

    if (existingRecord && existingRecord.punchOutTime) {
      return NextResponse.json(
        { error: 'Attendance already completed for today' },
        { status: 400 }
      );
    }

    // Create new attendance record (using IST time)
    const attendance = await prisma.attendanceRecord.create({
      data: {
        userId,
        punchInTime: now,
        punchInLat: latitude,
        punchInLng: longitude,
        date: todayDateObj,
      },
    });
    
    console.log('Attendance record created with IST:', {
      date: todayDateObj,
      punchInTime: now,
      userId
    });

    return NextResponse.json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error('Punch in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

