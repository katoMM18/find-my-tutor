'use client';
import { useEffect, useState } from 'react';

import { type AdminOverview } from '@/features/admin/types/admin.types';
import { http } from '@/shared/lib/http';

export const useAdminOverview = () => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void http
      .get<AdminOverview>('/admin/overview')
      .then(setOverview)
      .catch(() => setFailed(true));
  }, []);

  return { overview, failed };
};
