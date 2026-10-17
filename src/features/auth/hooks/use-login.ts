'use client';
import { signIn, getSession } from 'next-auth/react';

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { User } from '@/features/auth/types/auth.types';
import { LoginType } from '@/features/auth/validations/auth.validation';
import { useT } from '@/shared/hooks/use-t';
import { safeRedirect } from '@/shared/utils/safe-redirect';

export const useLogin = (callbackUrl?: string | null) => {
  const { setUser, setLoading, setError } = useAuthStore();
  const { t } = useT();

  const handleSession = async (setUserFn: typeof setUser) => {
    const session = await getSession();
    const sessionUser = session?.user as User | undefined;
    if (sessionUser) {
      setUserFn({
        id: sessionUser.id ?? '',
        name: sessionUser.name ?? '',
        email: sessionUser.email ?? '',
        role: sessionUser.role ?? 'student',
        avatar: sessionUser.avatar ?? '',
      });
    }
  };

  const login = async (data: LoginType) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t.auth.invalidCredentials);
        return;
      }

      if (result?.ok) {
        void handleSession(setUser);
        window.location.assign(safeRedirect(callbackUrl));
      }
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t.common.genericError);
    } finally {
      setLoading(false);
    }
  };

  return { login };
};
