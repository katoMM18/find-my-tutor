import { NextRequest, NextResponse } from 'next/server';

import { getMyProfileService, updateMyProfileService } from '@/features/profiles/service/profile.service';
import {
  StudentProfileSchema,
  TeacherProfileSchema,
} from '@/features/profiles/validations/profile.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = {
  id?: string;
  role?: 'teacher' | 'student';
};

async function getSessionUser() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  return user?.id && user.role ? user : null;
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const result = await getMyProfileService(user.id!, user.role!);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const schema = user.role === 'teacher' ? TeacherProfileSchema : StudentProfileSchema;
    const validated = await validateBody(req, schema);
    if (validated instanceof NextResponse) return validated;

    const result = await updateMyProfileService(user.id!, user.role!, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
