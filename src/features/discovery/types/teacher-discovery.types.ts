import { type TeacherSort } from '@/shared/const/subjects.const';
import { type VipStatus } from '@/shared/const/vip.const';

export type TeacherDiscoveryFilters = {
  search?: string;
  subject?: string;
  minExperience?: number;
  minRating?: number;
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
};

export type TeacherDiscoveryResult = {
  items: PublicTeacher[];
  total: number;
  page: number;
  limit: number;
};
