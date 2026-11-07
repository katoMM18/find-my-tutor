import { NextResponse } from 'next/server';

import { replyToRequestService } from '@/features/requests/service/student-request.service';
import { auth } from '@/shared/lib/auth';
import { getServerI18n } from '@/shared/utils/server-i18n';

type SessionUser = { id?: string; role?: 'teacher' | 'student' };

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!user?.id) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    const [{ id }, { locale }] = await Promise.all([params, getServerI18n()]);
    const result = await replyToRequestService(user.id, user.role === 'teacher' ? 'teacher' : 'student', id, locale);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
