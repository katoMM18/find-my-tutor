import { NextResponse } from 'next/server';

import { closeRequestService } from '@/features/requests/service/student-request.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };

// Closing is the only change a student can make to a request, so there is no body.
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userId = (session?.user as SessionUser | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const { id } = await params;
    const result = await closeRequestService(userId, id);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
