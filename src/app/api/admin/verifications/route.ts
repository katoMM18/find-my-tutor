import { NextResponse } from 'next/server';

import { listPendingVerificationsService } from '@/features/verification/service/tutor-verification.service';
import { auth } from '@/shared/lib/auth';
import { isAdminSession } from '@/shared/utils/admin';

export async function GET() {
  try {
    const session = await auth();
    if (!isAdminSession(session?.user as { isAdmin?: boolean } | undefined)) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    const result = await listPendingVerificationsService();
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
