import { redirect } from 'next/navigation';

import { AvailabilitySettings } from '@/features/availability/components/availability-settings';
import { auth } from '@/shared/lib/auth';

export default async function AvailabilityPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== 'teacher') redirect('/dashboard');

  return <AvailabilitySettings />;
}
