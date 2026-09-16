import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { askProjectAi } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const userPayload = getCurrentUser(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, prompt } = await req.json();

    if (!projectId || !prompt) {
      return NextResponse.json({ error: 'projectId and prompt are required' }, { status: 400 });
    }

    const result = await askProjectAi(projectId, prompt);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: error.message || 'AI request failed' }, { status: 500 });
  }
}
