import { type LessonArea, type LessonFormat } from '@/shared/const/lesson.const';
import { type RequestGoal } from '@/shared/const/requests.const';

export type PublicRequest = {
  id: string;
  subject: string;
  goal: RequestGoal;
  format: LessonFormat | null;
  area: LessonArea | null;
  budget: number | null;
  note: string;
  status: 'open' | 'closed';
  createdAt: string;
  replyCount: number;
};

// What a tutor sees: the request plus who posted it and whether they already answered.
export type TutorRequest = PublicRequest & {
  studentName: string;
  studentAvatar: string | null;
  replied: boolean;
};
