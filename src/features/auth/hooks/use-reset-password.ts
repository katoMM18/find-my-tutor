'use client';
import { useState } from 'react';

import { ResetPasswordFormType } from '@/features/auth/validations/auth.validation';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';

export const useResetPassword = (token: string) => {
  const { t } = useT();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = async (data: ResetPasswordFormType) => {
    setSaving(true);
    setError(null);
    try {
      await http.post('/auth/reset-password', { token, password: data.password });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error && err.message === 'INVALID_TOKEN' ? t.auth.resetInvalid : t.common.genericError);
    } finally {
      setSaving(false);
    }
  };

  return { resetPassword, saving, done, error };
};
