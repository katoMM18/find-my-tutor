import { NextResponse } from 'next/server';

import { auth } from '@/shared/lib/auth';
import { isAdminSession } from '@/shared/utils/admin';

type AdminSessionUser = { id?: string; isAdmin?: boolean };

// Use at the top of every /api/admin route. Returns the admin's user id, or a 403 response to send back as is.
export async function requireAdmin(): Promise<{ userId: string } | NextResponse> {
  const session = await auth();
  const user = session?.user as AdminSessionUser | undefined;
  if (!user?.id || !isAdminSession(user)) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  return { userId: user.id };
}
