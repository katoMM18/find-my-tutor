'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { VerifyEmailType } from '@/features/auth/validations/auth.validation';
import { useT } from '@/shared/hooks/use-t';
import { http } from '@/shared/lib/http';
import { safeRedirect } from '@/shared/utils/safe-redirect';

export const RESEND_COOLDOWN_SECONDS = 60;

export const useVerifyEmail = (next: string | null) => {
  const { update } = useSession();
  const { t } = useT();
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(() => Date.now() + RESEND_COOLDOWN_SECONDS * 1000);

  const errorText = (code: string) =>
    code === 'CODE_EXPIRED' ? t.auth.verifyExpired : code === 'TOO_MANY_ATTEMPTS' ? t.auth.verifyTooMany : t.auth.verifyInvalid;

  const verify = async (data: VerifyEmailType) => {
    setVerifying(true);
    setError(null);
    setNotice(null);
    try {
      await http.post('/auth/verify-email', data);
      // The jwt callback re-reads the flag from the database, so the protected layout lets the user in afterwards.
      await update();
      window.location.href = safeRedirect(next, '/profile?welcome=1');
    } catch (err) {
      setError(errorText(err instanceof Error ? err.message : ''));
      setVerifying(false);
    }
  };

  const resend = async () => {
    setError(null);
    setNotice(null);
    setCooldownUntil(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
    try {
      await http.post('/auth/verify-email/resend');
      setNotice(t.auth.verifyResent);
    } catch (err) {
      if (err instanceof Error && err.message === 'ALREADY_VERIFIED') window.location.href = safeRedirect(next, '/dashboard');
    }
  };

  return { verify, resend, verifying, error, notice, cooldownUntil };
};
