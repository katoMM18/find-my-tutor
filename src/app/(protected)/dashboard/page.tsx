import { DashboardHome } from '@/features/dashboard/components/dashboard-home';
import { auth } from '@/shared/lib/auth';

export default async function DashboardPage() {
  const session = await auth();
  const sessionUser = session?.user as { name?: string | null; role?: 'teacher' | 'student' } | undefined;
  const role = sessionUser?.role === 'teacher' ? 'teacher' : 'student';

  return <DashboardHome role={role} userName={sessionUser?.name ?? 'there'} />;
}
