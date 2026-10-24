import { NextRequest, NextResponse } from 'next/server';

import { cancelVipService, changeVipPlanService } from '@/features/vip/service/vip.service';
import { VipPlanSchema } from '@/features/vip/validations/vip.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { id?: string };

const getUserId = async () => {
  const session = await auth();
  return (session?.user as SessionUser | undefined)?.id ?? null;
};

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const validated = await validateBody(req, VipPlanSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await changeVipPlanService(userId, validated.data.status);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const result = await cancelVipService(userId);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
