import { notFound } from 'next/navigation';

import { AdminOverviewPanel } from '@/features/admin/components/admin-overview';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { auth } from '@/shared/lib/auth';
import { isAdminSession } from '@/shared/utils/admin';

export default async function AdminPage() {
  const session = await auth();
  if (!isAdminSession(session?.user as { isAdmin?: boolean } | undefined)) notFound();

  return (
    <AdminShell>
      <AdminOverviewPanel />
    </AdminShell>
  );
}
