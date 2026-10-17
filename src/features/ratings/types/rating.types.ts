export type RatingRequestStatus = 'pending' | 'approved' | 'submitted' | 'expired';

export type RatingRequestView = {
  id: string;
  status: RatingRequestStatus;
  teacherProfileId: string;
  counterpartId: string;
  counterpartName: string;
  counterpartAvatar: string | null;
  createdAt: string;
  expiresAt: string;
};

export type PublicReview = {
  id: string;
  value: number;
  comment: string;
  submittedAt: string;
  studentName: string;
  studentAvatar: string | null;
};

export type TeacherRatingSummary = {
  average: number | null;
  count: number;
};

export type TeacherReviews = TeacherRatingSummary & {
  reviews: PublicReview[];
};
