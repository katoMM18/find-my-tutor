export type SubjectCategory = {
  label: string;
  subjects: string[];
};

export const SUBJECT_CATALOG: SubjectCategory[] = [
  { label: 'Languages', subjects: ['English', 'Spanish', 'German', 'French', 'Georgian', 'Russian', 'SecondLanguage'] },
  { label: 'Science', subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'] },
  { label: 'Programming', subjects: ['JavaScript', 'TypeScript', 'React', 'Python', 'Software Engineering'] },
  { label: 'Humanities', subjects: ['History', 'Geography', 'Literature', 'Economics', 'Art', 'Civics'] },
];

// "Second foreign language" is chosen together with the language itself and stored as "SecondLanguage:German".
export const SECOND_LANGUAGE_SUBJECT = 'SecondLanguage';

export const SECOND_LANGUAGE_OPTIONS = [
  'English',
  'German',
  'French',
  'Spanish',
  'Russian',
  'Italian',
  'Turkish',
  'Chinese',
  'Japanese',
  'Arabic',
] as const;

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

// Radix Select cannot hold an empty value; this stands in for "no filter" and maps back to ''.
export const ANY_FILTER_VALUE = 'any';
