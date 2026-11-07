import { notFound } from 'next/navigation';

import { AdminVerificationQueue } from '@/features/verification/components/admin-verification-queue';
import { auth } from '@/shared/lib/auth';
import { isAdminSession } from '@/shared/utils/admin';

export default async function AdminVerificationsPage() {
  const session = await auth();
  if (!isAdminSession(session?.user as { isAdmin?: boolean } | undefined)) notFound();

  return <AdminVerificationQueue />;
}
