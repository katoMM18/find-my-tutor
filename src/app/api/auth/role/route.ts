import { NextRequest, NextResponse } from 'next/server';

import { changeRoleService } from '@/features/auth/service/auth.service';
import { ChangeRoleSchema } from '@/features/auth/validations/auth.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { id?: string };

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as SessionUser | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const validated = await validateBody(req, ChangeRoleSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await changeRoleService(userId, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
