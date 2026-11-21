import { type AdminCollection } from '@/features/admin/types/admin.types';
import { ADMIN_ACTIVITY_COLLECTIONS } from '@/shared/const/admin-activity.const';
import { ADMIN_PEOPLE_COLLECTIONS } from '@/shared/const/admin-people.const';

export const ADMIN_COLLECTION_KEYS = [
  'users',
  'teacherProfiles',
  'studentProfiles',
  'availability',
  'tutorVerifications',
  'media',
  'studentRequests',
  'conversations',
  'messages',
  'ratingRequests',
  'ratings',
  'vipSubscriptions',
  'vipPlans',
  'authTokens',
] as const;

export const ADMIN_PAGE_SIZE = 20;

// Every collection the admin panel can browse, with the fields it shows and edits, in sidebar order.
export const ADMIN_COLLECTIONS: AdminCollection[] = [...ADMIN_PEOPLE_COLLECTIONS, ...ADMIN_ACTIVITY_COLLECTIONS];
