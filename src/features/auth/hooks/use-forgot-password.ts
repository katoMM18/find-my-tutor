'use client';
import { useState } from 'react';

import { ForgotPasswordType } from '@/features/auth/validations/auth.validation';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';

export const useForgotPassword = () => {
  const { t } = useT();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = async (data: ForgotPasswordType) => {
    setSending(true);
    setError(null);
    try {
      await http.post('/auth/forgot-password', data);
      setSent(true);
    } catch {
      setError(t.common.genericError);
    } finally {
      setSending(false);
    }
  };

  return { requestReset, sending, sent, error };
};
