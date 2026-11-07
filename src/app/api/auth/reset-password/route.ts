import { NextRequest, NextResponse } from 'next/server';

import { resetPasswordService } from '@/features/auth/service/password-reset.service';
import { ResetPasswordSchema } from '@/features/auth/validations/auth.validation';
import { validateBody } from '@/shared/middleware/validate-body';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateBody(req, ResetPasswordSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await resetPasswordService(validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
