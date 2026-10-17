import { ALL_SUBJECTS, SUBJECT_ALIASES } from '@/shared/const/subjects.const';

export function normalizeSubject(subject: string): string {
  const key = subject.trim().toLowerCase();
  const compact = key.replace(/[\s_-]+/g, '');
  return (
    ALL_SUBJECTS.find((item) => item.toLowerCase() === key) ??
    ALL_SUBJECTS.find((item) => item.toLowerCase().replace(/\s+/g, '') === compact) ??
    SUBJECT_ALIASES[compact] ??
    subject.trim()
  );
}

export function normalizeSubjects(subjects: string[]): string[] {
  return [...new Set(subjects.map(normalizeSubject).filter(Boolean))];
}
