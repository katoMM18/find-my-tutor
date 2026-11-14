import { DEFAULT_PAPER, PAPER_BY_CATEGORY } from '@/shared/const/paper.const';
import { ALL_SUBJECTS, SECOND_LANGUAGE_SUBJECT, SUBJECT_ALIASES, SUBJECT_CATALOG } from '@/shared/const/subjects.const';

const SECOND_LANGUAGE_PREFIX = `${SECOND_LANGUAGE_SUBJECT}:`;

export function toSecondLanguageSubject(language: string): string {
  return `${SECOND_LANGUAGE_PREFIX}${language}`;
}

// The language inside a "SecondLanguage:German" subject, or null for any other subject.
export function secondLanguageOf(subject: string): string | null {
  return subject.startsWith(SECOND_LANGUAGE_PREFIX) ? subject.slice(SECOND_LANGUAGE_PREFIX.length) || null : null;
}

// Discovery filter value for a subject: picking "Second foreign language" matches every chosen language.
export function subjectFilterValue(subject: string): string | RegExp {
  return subject === SECOND_LANGUAGE_SUBJECT ? new RegExp(`^${SECOND_LANGUAGE_PREFIX}`) : subject;
}

export function normalizeSubject(subject: string): string {
  if (secondLanguageOf(subject)) return subject.trim();
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
  const normalized = secondLanguageOf(subject) ? SECOND_LANGUAGE_SUBJECT : normalizeSubject(subject);
  const category = SUBJECT_CATALOG.find((group) => group.subjects.includes(normalized))?.label;
  return (category && PAPER_BY_CATEGORY[category]) || DEFAULT_PAPER;
}

// Subjects saved as catalog keys (e.g. "SoftwareEngineering") read as words when no translation exists.
export function humanizeSubjectKey(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();
}
