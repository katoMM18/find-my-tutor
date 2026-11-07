export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

export type MyVerification = {
  status: VerificationStatus;
  reason: string;
};

export type PendingVerification = {
  id: string;
  tutorName: string;
  tutorEmail: string;
  submittedAt: string;
  fileUrl: string | null;
};
