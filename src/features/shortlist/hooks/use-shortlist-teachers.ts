'use client';

import { useEffect, useState } from 'react';

import { PublicTeacher } from '@/features/discovery/types/teacher-discovery.types';
import { useShortlistStore } from '@/features/shortlist/hooks/useShortlistStore';
import { http } from '@/shared/lib/http';

// Loads every saved tutor. Profiles that no longer exist drop off the list quietly.
export const useShortlistTeachers = () => {
  const { ids, remove, clear } = useShortlistStore();
  const [teachers, setTeachers] = useState<PublicTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const key = ids.join(',');

  useEffect(() => {
    let cancelled = false;
    const wanted = key ? key.split(',') : [];
    const timer = window.setTimeout(() => {
      setLoading(true);
      void Promise.allSettled(wanted.map((id) => http.get<PublicTeacher>(`/teachers/${id}`))).then((results) => {
        if (cancelled) return;
        setTeachers(results.flatMap((item) => (item.status === 'fulfilled' ? [item.value] : [])));
        setLoading(false);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [key]);

  // Keep the table in step with removals without waiting for a refetch.
  const visible = teachers.filter((teacher) => ids.includes(teacher.id));

  return { teachers: visible, count: ids.length, loading, remove, clear };
};
