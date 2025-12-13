import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// PUT update ticket status (staff can update their own tickets)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ticketId = parseInt(id);
    
    // Verify ticket exists and staff has access
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Only the assigned staff can update status (not the creator if different)
    if (decoded.role === 'STAFF' && ticket.assignedToId !== decoded.userId) {
      return NextResponse.json({ error: 'Only the assigned staff member can update ticket status' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Staff can only set status to OPEN, IN_PROGRESS, ON_HOLD, or COMPLETED' },
        { status: 400 }
      );
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
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
            createdAt: 'asc',
          },
        },
      },
    });

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket status' },
      { status: 500 }
    );
  }
}

