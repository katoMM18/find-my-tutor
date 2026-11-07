import { NextResponse } from 'next/server';

import { getMyVerificationService } from '@/features/verification/service/tutor-verification.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { id?: string };

export async function GET() {
  try {
    const session = await auth();
    const userId = (session?.user as SessionUser | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const result = await getMyVerificationService(userId);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
