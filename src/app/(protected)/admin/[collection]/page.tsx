import { notFound } from 'next/navigation';

import { AdminCollectionView } from '@/features/admin/components/admin-collection-view';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { AdminCollectionKeySchema } from '@/features/admin/validations/admin.validation';
import { auth } from '@/shared/lib/auth';
import { isAdminSession } from '@/shared/utils/admin';

export default async function AdminCollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const session = await auth();
  if (!isAdminSession(session?.user as { isAdmin?: boolean } | undefined)) notFound();

  const collection = AdminCollectionKeySchema.safeParse((await params).collection);
  if (!collection.success) notFound();

  return (
    <AdminShell>
      <AdminCollectionView key={collection.data} collectionKey={collection.data} />
    </AdminShell>
  );
}
