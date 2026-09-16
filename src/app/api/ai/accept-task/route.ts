import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const userPayload = getCurrentUser(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, title, description, priority, status, dueDateDaysFromNow, assigneeId } = await req.json();

    if (!projectId || !title) {
      return NextResponse.json({ error: 'projectId and title are required' }, { status: 400 });
    }

    const dueDate = dueDateDaysFromNow
      ? new Date(Date.now() + dueDateDaysFromNow * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const task = await prisma.task.create({
      data: {
        title,
        description: description || 'Generated and accepted from AI task suggestion.',
        status: status || 'TODO',
        priority: priority || 'HIGH',
        dueDate,
        projectId,
        assigneeId: assigneeId || userPayload.userId,
        createdById: userPayload.userId,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    // Create Activity Log
    await prisma.activityLog.create({
      data: {
        projectId,
        userId: userPayload.userId,
        action: 'AI_SUGGESTION_ACCEPTED',
        details: `Accepted AI suggested task: "${title}"`,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error('Accept AI Task Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add AI task' }, { status: 500 });
  }
}
