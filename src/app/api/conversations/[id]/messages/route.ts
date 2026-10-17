import { NextRequest, NextResponse } from 'next/server';

import {
  listMessagesService,
  sendMessageService,
} from '@/features/chat/service/chat.service';
import { SendMessageSchema } from '@/features/chat/validations/chat.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { id?: string };

async function getUser() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  return user?.id ?? null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUser();
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const { id } = await params;
    const page = Math.max(Number(req.nextUrl.searchParams.get('page')) || 1, 1);
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get('limit')) || 50, 1), 100);
    const result = await listMessagesService(userId, id, page, limit);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUser();
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const validated = await validateBody(req, SendMessageSchema);
    if (validated instanceof NextResponse) return validated;
    const { id } = await params;
    const result = await sendMessageService(userId, id, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
