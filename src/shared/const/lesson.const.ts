// Where a lesson happens. A tutor can offer several.
export const LESSON_FORMATS = ['online', 'tutor_place', 'student_home'] as const;

export type LessonFormat = (typeof LESSON_FORMATS)[number];

// Areas a tutor covers for in-person lessons: Tbilisi districts first, then other cities.
export const TBILISI_DISTRICTS = [
  'vake',
  'saburtalo',
  'mtatsminda',
  'krtsanisi',
  'isani',
  'samgori',
  'chughureti',
  'didube',
  'nadzaladevi',
  'gldani',
] as const;

export const OTHER_CITIES = ['batumi', 'kutaisi', 'rustavi', 'zugdidi', 'gori', 'telavi'] as const;

export const LESSON_AREAS = [...TBILISI_DISTRICTS, ...OTHER_CITIES] as const;

export type LessonArea = (typeof LESSON_AREAS)[number];

// Price per 60-minute lesson, in Georgian lari.
export const PRICE_MIN_GEL = 5;
export const PRICE_MAX_GEL = 500;

// Discovery price filter presets: "up to N ₾".
export const MAX_PRICE_FILTERS = ['30', '50', '80', '120'] as const;
