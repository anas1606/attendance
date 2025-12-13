import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET tickets assigned to staff
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const view = searchParams.get('view'); // 'assigned' or 'created'

    // Staff can see tickets assigned to them OR created by them
    const where: any = {};
    
    if (view === 'created') {
      // Show only tickets created by this user
      where.createdById = decoded.userId;
    } else if (view === 'assigned') {
      // Show only tickets assigned to this user
      where.assignedToId = decoded.userId;
    } else {
      // Default: Show all tickets (assigned to OR created by)
      where.OR = [
        { assignedToId: decoded.userId },
        { createdById: decoded.userId },
      ];
    }
    
    // Only add status filter if value exists and is not empty
    if (status && status !== '' && status.trim() !== '') {
      where.status = status;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        assignedTo: {
          include: {
            staffProfile: true,
          },
        },
        createdBy: {
          include: {
            staffProfile: true,
          },
        },
        comments: {
          include: {
            user: {
              include: {
                staffProfile: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

