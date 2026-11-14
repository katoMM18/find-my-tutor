export const TIMEZONE_OPTIONS = [
  'UTC',
  'Europe/Tbilisi',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
] as const;

// Most tutors teach in Georgia; used when a stored zone is not a real IANA name.
export const DEFAULT_TUTOR_TIMEZONE = 'Asia/Tbilisi';
