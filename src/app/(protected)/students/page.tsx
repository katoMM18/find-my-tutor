import { redirect } from 'next/navigation';

import { StudentDirectory } from '@/features/discovery/components/student-directory';
import { auth } from '@/shared/lib/auth';

export default async function StudentsPage() {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== 'teacher') redirect('/dashboard');

  return <StudentDirectory />;
}
