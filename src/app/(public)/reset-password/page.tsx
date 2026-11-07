import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <AuthPageShell>
      <ResetPasswordForm token={token ?? ''} />
    </AuthPageShell>
  );
}
