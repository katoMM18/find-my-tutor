import { type VipStatus } from '@/shared/const/vip.const';

export type OrderDemoTutor = {
  id: string;
  name: string;
  subject: string;
  vipStatus: VipStatus;
  rating: number;
  reviews: number;
};

// Illustrative rows for the home page demo, always labelled "Example". Not real tutors.
export const ORDER_DEMO_TUTORS: OrderDemoTutor[] = [
  { id: 'demo-1', name: 'Nino K.', subject: 'Mathematics', vipStatus: 'super_vip', rating: 3.9, reviews: 41 },
  { id: 'demo-2', name: 'Giorgi M.', subject: 'Physics', vipStatus: 'none', rating: 4.8, reviews: 112 },
  { id: 'demo-3', name: 'Ana T.', subject: 'English', vipStatus: 'vip', rating: 4.6, reviews: 23 },
  { id: 'demo-4', name: 'Luka B.', subject: 'Chemistry', vipStatus: 'none', rating: 4.2, reviews: 9 },
];
