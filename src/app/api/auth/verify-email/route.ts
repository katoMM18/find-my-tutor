import { NextRequest, NextResponse } from 'next/server';

import { verifyEmailService } from '@/features/auth/service/email-verification.service';
import { VerifyEmailSchema } from '@/features/auth/validations/auth.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';
import { getServerI18n } from '@/shared/utils/server-i18n';

type SessionUser = { id?: string };

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as SessionUser | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const validated = await validateBody(req, VerifyEmailSchema);
    if (validated instanceof NextResponse) return validated;
    const { locale } = await getServerI18n();
    const result = await verifyEmailService(userId, validated.data.code, locale);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
