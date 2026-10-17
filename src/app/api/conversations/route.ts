import { NextRequest, NextResponse } from 'next/server';

import {
  createConversationService,
  listConversationsService,
} from '@/features/chat/service/chat.service';
import { CreateConversationSchema } from '@/features/chat/validations/chat.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { id?: string };

async function getUser() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  return user?.id ?? null;
}

export async function GET() {
  try {
    const userId = await getUser();
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const result = await listConversationsService(userId);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUser();
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const validated = await validateBody(req, CreateConversationSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await createConversationService(userId, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
