import { NextRequest, NextResponse } from 'next/server';

import { activateVipService, getVipStatusService } from '@/features/vip/service/vip.service';
import { VipSubscriptionSchema } from '@/features/vip/validations/vip.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { id?: string };

async function getUserId() {
  const session = await auth();
  return (session?.user as SessionUser | undefined)?.id ?? null;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const result = await getVipStatusService(userId);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const validated = await validateBody(req, VipSubscriptionSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await activateVipService(userId, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
