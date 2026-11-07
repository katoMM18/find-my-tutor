export type StudentDiscoveryFilters = {
  search?: string;
  // A RegExp only after the service expands a subject group (e.g. every second foreign language).
  subject?: string | RegExp;
  page: number;
  limit: number;
};

export type PublicStudent = {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
  bio: string;
  subjects: string[];
  vipStatus: VipStatus;
};

export type StudentDiscoveryResult = {
  items: PublicStudent[];
  total: number;
  page: number;
  limit: number;
};
import { type VipStatus } from '@/shared/const/vip.const';
