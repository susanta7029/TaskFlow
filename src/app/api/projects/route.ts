import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, ensureDbUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const userPayload = getCurrentUser(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureDbUser(userPayload);

    // Get projects where user is owner or member
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userPayload.userId },
          { members: { some: { userId: userPayload.userId } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: { select: { id: true, status: true, priority: true, dueDate: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = getCurrentUser(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await ensureDbUser(userPayload);
    const effectiveUserId = dbUser ? dbUser.id : userPayload.userId;

    const { name, description } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: effectiveUserId,
        members: {
          create: [{ userId: effectiveUserId, role: 'OWNER' }],
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: true,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        projectId: project.id,
        userId: effectiveUserId,
        action: 'PROJECT_CREATED',
        details: `Created project "${name}"`,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 500 });
  }
}
