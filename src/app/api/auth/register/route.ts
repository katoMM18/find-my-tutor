import { NextRequest, NextResponse } from 'next/server';

import { registerService } from '@/features/auth/service/auth.service';
import { issueVerificationCodeService } from '@/features/auth/service/email-verification.service';
import { SignUpSchema } from '@/features/auth/validations/auth.validation';
import { validateBody } from '@/shared/middleware/validate-body';
import { getServerI18n } from '@/shared/utils/server-i18n';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateBody(req, SignUpSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await registerService(validated.data);
    if ('id' in data) {
      const { locale } = await getServerI18n();
      await issueVerificationCodeService(data.id, locale);
    }
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
