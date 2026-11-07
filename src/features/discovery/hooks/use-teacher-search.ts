'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TeacherDiscoveryResult } from '@/features/discovery/types/teacher-discovery.types';
import { http } from '@/shared/lib/http';

export const TEACHER_FILTER_KEYS = ['search', 'subject', 'day', 'format', 'area', 'maxPrice', 'minExperience', 'minRating', 'sort'] as const;

export type TeacherFilterKey = (typeof TEACHER_FILTER_KEYS)[number];

export type TeacherFilterValues = Record<TeacherFilterKey, string>;

const PAGE_SIZE = 12;

export const useTeacherSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const values = Object.fromEntries(
    TEACHER_FILTER_KEYS.map((key) => [key, searchParams.get(key) ?? ''])
  ) as TeacherFilterValues;
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);

  const [result, setResult] = useState<TeacherDiscoveryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(queryString);
    // "today" stays readable in the URL; the API gets the viewer's own weekday.
    if (params.get('day') === 'today') params.set('day', String(new Date().getDay()));
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      http
        .get<TeacherDiscoveryResult>('/teachers', {
          params: { ...Object.fromEntries(params.entries()), limit: PAGE_SIZE },
        })
        .then((data) => !cancelled && setResult(data))
        .catch(() => !cancelled && setError('LOAD_ERROR'))
        .finally(() => !cancelled && setLoading(false));
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [queryString, attempt]);

  const update = (changes: Partial<Record<TeacherFilterKey | 'page', string>>) => {
    const params = new URLSearchParams(queryString);
    Object.entries(changes).forEach(([key, value]) => (value ? params.set(key, value) : params.delete(key)));
    if (!('page' in changes)) params.delete('page');
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const clear = () => router.replace(pathname, { scroll: false });

  const retry = () => setAttempt((value) => value + 1);

  const activeCount = TEACHER_FILTER_KEYS.filter((key) => key !== 'sort' && values[key]).length;
  const totalPages = result ? Math.max(Math.ceil(result.total / PAGE_SIZE), 1) : 1;

  return { values, page, totalPages, result, loading, error, update, clear, retry, activeCount };
};
