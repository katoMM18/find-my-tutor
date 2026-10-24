import { NextRequest, NextResponse } from 'next/server';

import { createVipCheckoutService } from '@/features/vip/service/vip.service';
import { VipPlanSchema } from '@/features/vip/validations/vip.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

type SessionUser = { id?: string };

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as SessionUser | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const validated = await validateBody(req, VipPlanSchema);
    if (validated instanceof NextResponse) return validated;
    const returnUrl = new URL('/profile?billing=success', req.url).toString();
    const result = await createVipCheckoutService(userId, validated.data.status, returnUrl);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
