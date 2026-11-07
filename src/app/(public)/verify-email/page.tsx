import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { VerifyEmailForm } from '@/features/auth/components/verify-email-form';
import { auth } from '@/shared/lib/auth';

type SessionUser = { email?: string | null; isVerified?: boolean };

export default async function VerifyEmailPage() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user) redirect('/sign-in');
  if (user.isVerified !== false) redirect('/dashboard');

  return (
    <AuthPageShell>
      <Suspense>
        <VerifyEmailForm email={user.email ?? ''} />
      </Suspense>
    </AuthPageShell>
  );
}
