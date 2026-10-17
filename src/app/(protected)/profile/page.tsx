import { ProfileEditor } from '@/features/profiles/components/profile-editor';
import { auth } from '@/shared/lib/auth';

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const role = (session?.user as { role?: 'teacher' | 'student' } | undefined)?.role === 'teacher' ? 'teacher' : 'student';

  return <ProfileEditor role={role} welcome={params.welcome === '1'} />;
}
