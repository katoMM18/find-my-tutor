import { NextRequest, NextResponse } from 'next/server';

import { requestPasswordResetService } from '@/features/auth/service/password-reset.service';
import { ForgotPasswordSchema } from '@/features/auth/validations/auth.validation';
import { validateBody } from '@/shared/middleware/validate-body';
import { getServerI18n } from '@/shared/utils/server-i18n';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateBody(req, ForgotPasswordSchema);
    if (validated instanceof NextResponse) return validated;
    const { locale } = await getServerI18n();
    const result = await requestPasswordResetService(validated.data.email, locale);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
