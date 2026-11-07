'use client';
import { signIn } from 'next-auth/react';

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { SignUpType } from '@/features/auth/validations/auth.validation';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';
import { safeRedirect } from '@/shared/utils/safe-redirect';

export const useRegister = (callbackUrl?: string | null) => {
  const { setLoading, setError } = useAuthStore();
  const { t } = useT();

  const register = async (data: SignUpType) => {
    setLoading(true);
    setError(null);
    try {
      await http.post('/auth/register', data);
      const result = await signIn('credentials', { email: data.email, password: data.password, redirect: false });
      const next = safeRedirect(callbackUrl, '/profile?welcome=1');
      window.location.href = result?.ok ? `/verify-email?next=${encodeURIComponent(next)}` : '/sign-in';
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      setError(code === 'EMAIL_TAKEN' ? t.auth.emailTaken : t.auth.registrationFailed);
      setLoading(false);
    }
  };

  return { register };
};
