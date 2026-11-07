'use client';
import { useCallback, useEffect, useState } from 'react';

import { MyVerification } from '@/features/verification/types/verification.types';
import { http } from '@/shared/lib/http';

export const useMyVerification = () => {
  const [verification, setVerification] = useState<MyVerification | null>(null);

  const refresh = useCallback(() => {
    void http.get<MyVerification>('/verification/me').then(setVerification).catch(() => setVerification(null));
  }, []);

  useEffect(refresh, [refresh]);

  return { verification, refresh };
};
