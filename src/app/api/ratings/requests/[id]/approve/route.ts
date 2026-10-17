import { NextResponse } from 'next/server';

import { approveRatingRequestService } from '@/features/ratings/service/rating.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string; role?: 'teacher' | 'student' };

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!user?.id || !user.role) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const { id } = await params;
    const result = await approveRatingRequestService(user.id, user.role, id);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
