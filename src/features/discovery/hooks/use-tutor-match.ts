'use client';

import { useState } from 'react';

import { TutorMatchResult } from '@/features/discovery/types/teacher-discovery.types';
import { MatchType } from '@/features/discovery/validations/match.validation';
import { http } from '@/shared/lib/http';

export const useTutorMatch = () => {
  const [result, setResult] = useState<TutorMatchResult | null>(null);
  const [answers, setAnswers] = useState<MatchType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const find = async (data: MatchType) => {
    setLoading(true);
    setError(null);
    try {
      setResult(await http.post<TutorMatchResult>('/teachers/match', data));
      setAnswers(data);
    } catch {
      setError('MATCH_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setAnswers(null);
    setError(null);
  };

  return { result, answers, loading, error, find, reset };
};
