import { StudentRequests } from '@/features/requests/components/student-requests';
import { TutorRequestFeed } from '@/features/requests/components/tutor-request-feed';
import { auth } from '@/shared/lib/auth';

export default async function RequestsPage() {
  const session = await auth();
  const role = (session?.user as { role?: 'teacher' | 'student' } | undefined)?.role;

  return role === 'teacher' ? <TutorRequestFeed /> : <StudentRequests />;
}
