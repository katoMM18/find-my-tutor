import { userRepository } from '@/features/auth/repository/user.repository';
import { sendVerificationResultEmail } from '@/features/auth/service/auth-email.service';
import { getPrivateMediaUrlService } from '@/features/media/service/media.service';
import { profileRepository } from '@/features/profiles/repository/profile.repository';
import { tutorVerificationRepository } from '@/features/verification/repository/tutor-verification.repository';
import { MyVerification, PendingVerification } from '@/features/verification/types/verification.types';
import { VerificationDecisionType } from '@/features/verification/validations/verification.validation';
import { type Locale } from '@/shared/const/i18n.const';
import { ServiceResult } from '@/shared/types/common';

// A tutor's diploma upload goes into the review queue. Once approved, new uploads don't reopen the check.
export async function submitVerificationService(userId: string, mediaId: string): Promise<ServiceResult<MyVerification>> {
  const existing = await tutorVerificationRepository.findByUserId(userId);
  if (existing?.status === 'approved') return { data: { status: 'approved', reason: '' }, status: 200 };

  await tutorVerificationRepository.upsertPending(userId, mediaId);
  return { data: { status: 'pending', reason: '' }, status: 201 };
}

export async function getMyVerificationService(userId: string): Promise<ServiceResult<MyVerification>> {
  const record = await tutorVerificationRepository.findByUserId(userId);
  return { data: { status: record?.status ?? 'none', reason: record?.reason ?? '' }, status: 200 };
}

export async function listPendingVerificationsService(): Promise<ServiceResult<PendingVerification[]>> {
  const pending = await tutorVerificationRepository.findPending();
  const items = await Promise.all(
    pending.map(async (record) => {
      const userId = record.userId.toString();
      const [user, file] = await Promise.all([
        userRepository.findById(userId),
        getPrivateMediaUrlService(userId, record.mediaId.toString()),
      ]);
      return {
        id: record._id.toString(),
        tutorName: user?.name ?? '',
        tutorEmail: user?.email ?? '',
        submittedAt: record.submittedAt.toISOString(),
        fileUrl: 'url' in file.data ? file.data.url : null,
      };
    })
  );
  return { data: items, status: 200 };
}

// Approving sets the public Verified badge; rejecting removes it. The tutor gets an email either way.
export async function reviewVerificationService(
  id: string,
  decision: VerificationDecisionType,
  reviewerEmail: string,
  locale: Locale
): Promise<ServiceResult<{ status: 'approved' | 'rejected' }>> {
  const record = await tutorVerificationRepository.findById(id);
  if (!record) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (record.status !== 'pending') return { data: { error: 'ALREADY_REVIEWED' }, status: 409 };

  const approved = decision.decision === 'approve';
  const userId = record.userId.toString();
  await tutorVerificationRepository.setDecision(id, {
    status: approved ? 'approved' : 'rejected',
    reason: approved ? '' : decision.reason,
    reviewerEmail,
  });
  await profileRepository.setTeacherVerified(userId, approved);

  const user = await userRepository.findById(userId);
  if (user) await sendVerificationResultEmail({ email: user.email, name: user.name }, { approved, reason: decision.reason }, locale);

  return { data: { status: approved ? 'approved' : 'rejected' }, status: 200 };
}
