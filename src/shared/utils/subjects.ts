import { DEFAULT_PAPER, PAPER_BY_CATEGORY } from '@/shared/const/paper.const';
import { ALL_SUBJECTS, SUBJECT_ALIASES, SUBJECT_CATALOG } from '@/shared/const/subjects.const';

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

// The copy-paper colour class for a subject's group; unknown subjects get plain white paper.
export function paperForSubject(subject: string | undefined): string {
  if (!subject) return DEFAULT_PAPER;
  const normalized = normalizeSubject(subject);
  const category = SUBJECT_CATALOG.find((group) => group.subjects.includes(normalized))?.label;
  return (category && PAPER_BY_CATEGORY[category]) || DEFAULT_PAPER;
}
