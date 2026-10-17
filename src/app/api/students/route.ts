import { NextRequest, NextResponse } from 'next/server';

import { listStudentsService } from '@/features/discovery/service/student-discovery.service';
import { auth } from '@/shared/lib/auth';

const MAX_LIMIT = 24;

type SessionUser = { id?: string; role?: 'teacher' | 'student' };

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as SessionUser | undefined;
    if (!user?.id || !user.role) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const params = req.nextUrl.searchParams;
    const result = await listStudentsService(user.role, {
      search: params.get('search') || undefined,
      subject: params.get('subject') || undefined,
      page: Math.max(Number(params.get('page')) || 1, 1),
      limit: Math.min(Math.max(Number(params.get('limit')) || 12, 1), MAX_LIMIT),
    });
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
