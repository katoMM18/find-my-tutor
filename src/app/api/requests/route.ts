import { NextRequest, NextResponse } from 'next/server';

import { createRequestService, listRequestsService } from '@/features/requests/service/student-request.service';
import { CreateRequestSchema } from '@/features/requests/validations/request.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { id?: string; role?: 'teacher' | 'student' };

const sessionUser = async () => {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  return user?.id ? { id: user.id, role: user.role === 'teacher' ? 'teacher' : 'student' } as const : null;
};

export async function GET() {
  try {
    const user = await sessionUser();
    if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const result = await listRequestsService(user.id, user.role);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await sessionUser();
    if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const validated = await validateBody(req, CreateRequestSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await createRequestService(user.id, user.role, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
