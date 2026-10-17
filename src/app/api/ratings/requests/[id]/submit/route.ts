import { NextRequest, NextResponse } from 'next/server';

import { submitRatingService } from '@/features/ratings/service/rating.service';
import { SubmitRatingSchema } from '@/features/ratings/validations/rating.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { id?: string; role?: 'teacher' | 'student' };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!user?.id || !user.role) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const validated = await validateBody(req, SubmitRatingSchema);
    if (validated instanceof NextResponse) return validated;
    const { id } = await params;
    const result = await submitRatingService(user.id, user.role, id, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
