'use client';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { ChangeRoleType } from '@/features/auth/validations/auth.validation';
import { http } from '@/shared/lib/http';

export const useChangeRole = () => {
  const router = useRouter();
  const { update } = useSession();
  const [switching, setSwitching] = useState(false);
  const [failed, setFailed] = useState(false);

  const changeRole = async (role: ChangeRoleType['role']) => {
    setSwitching(true);
    setFailed(false);
    try {
      await http.patch<ChangeRoleType>('/auth/role', { role });
      // The jwt callback re-reads the role from the database, so refreshing the session picks it up.
      await update();
      router.push(role === 'teacher' ? '/profile?welcome=1' : '/dashboard');
      router.refresh();
    } catch {
      setFailed(true);
      setSwitching(false);
    }
  };

  return { changeRole, switching, failed };
};
