import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUser(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const existing = await prisma.task.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: { status },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        projectId: existing.projectId,
        userId: userPayload.userId,
        action: 'STATUS_CHANGED',
        details: `Moved "${updated.title}" from ${existing.status} to ${status}`,
      },
    });

    return NextResponse.json({ task: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update task status' }, { status: 500 });
  }
}
