export type SubjectCategory = {
  label: string;
  subjects: string[];
};

export const SUBJECT_CATALOG: SubjectCategory[] = [
  { label: 'Languages', subjects: ['English', 'Spanish', 'German', 'French', 'Georgian', 'Russian'] },
  { label: 'Science', subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'] },
  { label: 'Programming', subjects: ['JavaScript', 'TypeScript', 'React', 'Python', 'Software Engineering'] },
  { label: 'Humanities', subjects: ['History', 'Geography', 'Literature', 'Economics'] },
];

export const ALL_SUBJECTS = SUBJECT_CATALOG.flatMap((category) => category.subjects);

export const POPULAR_SUBJECTS = ['English', 'Mathematics', 'Physics', 'Python', 'Spanish', 'Chemistry'];

export const TEACHER_SORTS = ['recommended', 'rating', 'experience'] as const;

export type TeacherSort = (typeof TEACHER_SORTS)[number];

export const EXPERIENCE_VALUES = ['1', '3', '5', '10'];

export const RATING_VALUES = ['4', '4.5'];

export const SUBJECT_ALIASES: Record<string, string> = {
  math: 'Mathematics',
  maths: 'Mathematics',
  softwareengineering: 'Software Engineering',
  js: 'JavaScript',
  ts: 'TypeScript',
};
