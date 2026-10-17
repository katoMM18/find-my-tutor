import { redirect } from 'next/navigation';

import { HomePage } from '@/features/marketing/components/home-page';
import { auth } from '@/shared/lib/auth';
import { isSessionRole } from '@/shared/utils/session-role';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (isSessionRole(role)) redirect('/dashboard');

  return <HomePage />;
}
