'use client';

import { useEffect, useState } from 'react';

import { PriceGuide } from '@/features/discovery/types/teacher-discovery.types';
import { type LessonArea } from '@/shared/const/lesson.const';
import { http } from '@/shared/lib/http';

export const usePriceGuide = (subject: string | undefined, area: LessonArea | undefined) => {
  const [guide, setGuide] = useState<PriceGuide | null>(null);

  useEffect(() => {
    if (!subject) return;
    let cancelled = false;
    http
      .get<PriceGuide>('/teachers/price-guide', { params: area ? { subject, area } : { subject } })
      .then((data) => !cancelled && setGuide(data))
      .catch(() => !cancelled && setGuide(null));
    return () => {
      cancelled = true;
    };
  }, [subject, area]);

  return guide;
};
