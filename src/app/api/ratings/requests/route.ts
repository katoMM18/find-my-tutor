import { NextRequest, NextResponse } from 'next/server';

import {
  createRatingRequestService,
  listRatingRequestsService,
} from '@/features/ratings/service/rating.service';
import { CreateRatingRequestSchema } from '@/features/ratings/validations/rating.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { id?: string; role?: 'teacher' | 'student' };

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!user?.id || !user.role) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const validated = await validateBody(req, CreateRatingRequestSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await createRatingRequestService(user.id, user.role, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!user?.id || !user.role) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const result = await listRatingRequestsService(user.id, user.role);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
