import { NextRequest, NextResponse } from 'next/server';

import { reviewVerificationService } from '@/features/verification/service/tutor-verification.service';
import { VerificationDecisionSchema } from '@/features/verification/validations/verification.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';
import { isAdminSession } from '@/shared/utils/admin';
import { getServerI18n } from '@/shared/utils/server-i18n';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email || !isAdminSession(session?.user as { isAdmin?: boolean } | undefined)) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const validated = await validateBody(req, VerificationDecisionSchema);
    if (validated instanceof NextResponse) return validated;
    const [{ id }, { locale }] = await Promise.all([params, getServerI18n()]);
    const result = await reviewVerificationService(id, validated.data, email, locale);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
