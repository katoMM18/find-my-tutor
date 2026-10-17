import { NextResponse } from 'next/server';

import { markConversationReadService } from '@/features/chat/service/chat.service';
import { auth } from '@/shared/lib/auth';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string } | undefined;
    if (!user?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const { id } = await params;
    const result = await markConversationReadService(user.id, id);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
