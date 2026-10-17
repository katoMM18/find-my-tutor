import { Suspense } from 'react';

import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { LoginForm } from '@/features/auth/components/login-form';

export default function SignInPage() {
  return (
    <AuthPageShell>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
