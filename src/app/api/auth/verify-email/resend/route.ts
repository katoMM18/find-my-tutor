import { NextResponse } from 'next/server';

import { issueVerificationCodeService } from '@/features/auth/service/email-verification.service';
import { auth } from '@/shared/lib/auth';
import { getServerI18n } from '@/shared/utils/server-i18n';

type SessionUser = { id?: string };

// No request body: the signed-in user is the only input.
export async function POST() {
  try {
    const session = await auth();
    const userId = (session?.user as SessionUser | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const { locale } = await getServerI18n();
    const result = await issueVerificationCodeService(userId, locale);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
