import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/verification/repository/tutor-verification.repository', () => ({
  tutorVerificationRepository: { findByUserId: vi.fn(), upsertPending: vi.fn(), findById: vi.fn(), setDecision: vi.fn(), findPending: vi.fn() },
}));
vi.mock('@/features/profiles/repository/profile.repository', () => ({ profileRepository: { setTeacherVerified: vi.fn() } }));
vi.mock('@/features/auth/repository/user.repository', () => ({ userRepository: { findById: vi.fn() } }));
vi.mock('@/features/auth/service/auth-email.service', () => ({ sendVerificationResultEmail: vi.fn() }));
vi.mock('@/features/media/service/media.service', () => ({ getPrivateMediaUrlService: vi.fn() }));

import { userRepository } from '@/features/auth/repository/user.repository';
import { sendVerificationResultEmail } from '@/features/auth/service/auth-email.service';
import { profileRepository } from '@/features/profiles/repository/profile.repository';
import { tutorVerificationRepository } from '@/features/verification/repository/tutor-verification.repository';

import { reviewVerificationService, submitVerificationService } from './tutor-verification.service';

const repo = vi.mocked(tutorVerificationRepository);
const USER_ID = '507f1f77bcf86cd799439011';
const MEDIA_ID = '507f1f77bcf86cd799439012';
const pending = { _id: { toString: () => 'ver_1' }, userId: { toString: () => USER_ID }, status: 'pending' };

describe('submitVerificationService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('queues a new upload for review', async () => {
    repo.findByUserId.mockResolvedValueOnce(null);
    expect((await submitVerificationService(USER_ID, MEDIA_ID)).data).toEqual({ status: 'pending', reason: '' });
    expect(repo.upsertPending).toHaveBeenCalledWith(USER_ID, MEDIA_ID);
  });

  it('keeps an approved tutor approved when they upload more files', async () => {
    repo.findByUserId.mockResolvedValueOnce({ status: 'approved' } as never);
    await submitVerificationService(USER_ID, MEDIA_ID);
    expect(repo.upsertPending).not.toHaveBeenCalled();
  });
});

describe('reviewVerificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userRepository.findById).mockResolvedValue({ email: 'tutor@example.com', name: 'Nino' } as never);
  });

  it('approving sets the badge and emails the tutor', async () => {
    repo.findById.mockResolvedValueOnce(pending as never);
    const result = await reviewVerificationService('ver_1', { decision: 'approve', reason: '' }, 'admin@example.com', 'en');
    expect(result.data).toEqual({ status: 'approved' });
    expect(profileRepository.setTeacherVerified).toHaveBeenCalledWith(USER_ID, true);
    expect(sendVerificationResultEmail).toHaveBeenCalledWith(expect.anything(), { approved: true, reason: '' }, 'en');
  });

  it('rejecting stores the reason and removes the badge', async () => {
    repo.findById.mockResolvedValueOnce(pending as never);
    await reviewVerificationService('ver_1', { decision: 'reject', reason: 'Name does not match' }, 'admin@example.com', 'en');
    expect(repo.setDecision).toHaveBeenCalledWith('ver_1', { status: 'rejected', reason: 'Name does not match', reviewerEmail: 'admin@example.com' });
    expect(profileRepository.setTeacherVerified).toHaveBeenCalledWith(USER_ID, false);
  });

  it('refuses a second decision', async () => {
    repo.findById.mockResolvedValueOnce({ ...pending, status: 'approved' } as never);
    expect((await reviewVerificationService('ver_1', { decision: 'approve', reason: '' }, 'a@b.c', 'en')).status).toBe(409);
  });
});
