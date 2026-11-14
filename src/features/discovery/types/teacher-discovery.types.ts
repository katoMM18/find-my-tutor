import { type LessonArea, type LessonFormat } from '@/shared/const/lesson.const';
import { type TeacherSort } from '@/shared/const/subjects.const';
import { type VipStatus } from '@/shared/const/vip.const';

export type TeacherDiscoveryFilters = {
  search?: string;
  // A RegExp only after the service expands a subject group (e.g. every second foreign language).
  subject?: string | RegExp;
  minExperience?: number;
  minRating?: number;
  day?: number;
  format?: LessonFormat;
  area?: LessonArea;
  maxPrice?: number;
  sort?: TeacherSort;
  page: number;
  limit: number;
};

export type PublicTeacher = {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  bio: string;
  subjects: string[];
  experienceYears: number;
  education: string;
  qualifications: string;
  rating: number | null;
  reviewCount: number;
  availableDays: number[];
  timezone: string | null;
  vipStatus: VipStatus;
  pricePerLesson: number | null;
  lessonFormats: LessonFormat[];
  areas: LessonArea[];
  acceptingStudents: boolean;
  verified: boolean;
  responseMinutes: number | null;
};

export type TeacherDiscoveryResult = {
  items: PublicTeacher[];
  total: number;
  page: number;
  limit: number;
};

// Typical price for a subject: the median of listed tutors, in the area when enough tutors cover it.
export type PriceGuide = {
  median: number | null;
  count: number;
  scope: 'area' | 'all';
};

// Why a tutor was matched. The client turns each into one short, translated line.
export type MatchReason =
  | { kind: 'days'; days: number[] }
  | { kind: 'budget'; difference: number }
  | { kind: 'nearby'; area: LessonArea }
  | { kind: 'fastReply'; minutes: number }
  | { kind: 'rated'; rating: number; count: number }
  | { kind: 'verified' };

export type TutorMatch = {
  teacher: PublicTeacher;
  score: number;
  reasons: MatchReason[];
};

export type TutorMatchResult = {
  matches: TutorMatch[];
  considered: number;
};
