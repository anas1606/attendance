import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/middleware/auth';
import { startOfMonth, endOfMonth } from 'date-fns';
import { getTodayDateIST, getTodayIST, getStartOfMonthIST, getEndOfMonthIST } from '@/utils/timezone';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // Format: YYYY-MM
    const userId = authResult.user.userId;

    let startDate: Date;
    let endDate: Date;

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      // Use IST timezone for month boundaries
      startDate = getStartOfMonthIST(year, monthNum);
      endDate = getEndOfMonthIST(year, monthNum);
    } else {
      // Default to current month in IST
      const today = getTodayIST();
      const year = today.getFullYear();
      const monthNum = today.getMonth() + 1;
      startDate = getStartOfMonthIST(year, monthNum);
      endDate = getEndOfMonthIST(year, monthNum);
    }

    // Get attendance records for the month
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        lunchBreaks: true,
      },
      orderBy: { date: 'desc' },
    });

    // Get today's status (using IST)
    const todayDateIST = getTodayIST(); // Get today's date in IST
    console.log('Fetching today attendance record for IST date:', todayDateIST);
    
    const todayRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId,
        date: todayDateIST,
      },
      include: {
        lunchBreaks: true,
      },
    });
    
    console.log('Found today record:', todayRecord ? 'Yes' : 'No', todayRecord?.id);

    let status = 'not_punched_in';
    let activeLunchBreak = null;

    if (todayRecord) {
      // Check if on leave
      if (todayRecord.workDone?.startsWith('ON_LEAVE')) {
        status = 'on_leave';
      } else if (todayRecord.punchOutTime) {
        status = 'punched_out';
      } else {
        activeLunchBreak = todayRecord.lunchBreaks.find(
          (lb) => !lb.lunchEndTime
        );
        if (activeLunchBreak) {
          status = 'on_lunch_break';
        } else {
          status = 'punched_in';
        }
      }
    }

    return NextResponse.json({
      success: true,
      attendanceRecords,
      todayStatus: {
        status,
        record: todayRecord,
        activeLunchBreak,
      },
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

