import { NextRequest, NextResponse } from 'next/server';

import {
  getMyAvailabilityService,
  updateMyAvailabilityService,
} from '@/features/availability/service/availability.service';
import { AvailabilitySchema } from '@/features/availability/validations/availability.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = {
  id?: string;
  role?: 'teacher' | 'student';
};

async function getUser() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  return user?.id && user.role ? user : null;
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const result = await getMyAvailabilityService(user.id!, user.role!);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const validated = await validateBody(req, AvailabilitySchema);
    if (validated instanceof NextResponse) return validated;
    const result = await updateMyAvailabilityService(user.id!, user.role!, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
