import { Suspense } from 'react';

import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { SignUpForm } from '@/features/auth/components/signup-form';

export default function SignUpPage() {
  return (
    <AuthPageShell>
      <Suspense>
        <SignUpForm />
      </Suspense>
    </AuthPageShell>
  );
}
