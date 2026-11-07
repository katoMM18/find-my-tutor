import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/repository/user.repository', () => ({
  userRepository: { findByEmail: vi.fn(), updateById: vi.fn() },
}));

vi.mock('@/features/auth/repository/auth-token.repository', () => ({
  authTokenRepository: { findLatestActive: vi.fn(), findActiveByHash: vi.fn(), invalidateAll: vi.fn(), create: vi.fn() },
}));

vi.mock('@/features/auth/service/auth-email.service', () => ({
  appUrl: (path: string) => `https://app.test${path}`,
  sendPasswordResetEmail: vi.fn(),
}));

import { authTokenRepository } from '@/features/auth/repository/auth-token.repository';
import { userRepository } from '@/features/auth/repository/user.repository';
import { sendPasswordResetEmail } from '@/features/auth/service/auth-email.service';
import { hashPassword, hashToken } from '@/shared/utils/password';

import { requestPasswordResetService, resetPasswordService } from './password-reset.service';

const users = vi.mocked(userRepository);
const tokens = vi.mocked(authTokenRepository);
const USER_ID = '507f1f77bcf86cd799439011';
const user = { _id: { toString: () => USER_ID }, name: 'Ana', email: 'ana@example.com' };

describe('requestPasswordResetService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('answers the same for unknown emails and sends nothing', async () => {
    users.findByEmail.mockResolvedValueOnce(null);
    expect(await requestPasswordResetService('nobody@example.com', 'en')).toEqual({ data: { sent: true }, status: 200 });
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('emails a one-time link whose token is stored hashed', async () => {
    users.findByEmail.mockResolvedValueOnce(user as never);
    tokens.findLatestActive.mockResolvedValueOnce(null);
    await requestPasswordResetService('ana@example.com', 'en');
    const url = vi.mocked(sendPasswordResetEmail).mock.calls[0][1];
    const token = new URL(url).searchParams.get('token') ?? '';
    expect(url.startsWith('https://app.test/reset-password?token=')).toBe(true);
    expect(tokens.create).toHaveBeenCalledWith(expect.objectContaining({ purpose: 'reset_password', tokenHash: hashToken(token) }));
  });
});

describe('resetPasswordService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects an unknown or used token', async () => {
    tokens.findActiveByHash.mockResolvedValueOnce(null);
    expect((await resetPasswordService({ token: 'x'.repeat(43), password: 'newpassword' })).status).toBe(400);
  });

  it('sets the new password, verifies the email and retires the link', async () => {
    tokens.findActiveByHash.mockResolvedValueOnce({ userId: { toString: () => USER_ID } } as never);
    const result = await resetPasswordService({ token: 'x'.repeat(43), password: 'newpassword' });
    expect(result.status).toBe(200);
    expect(users.updateById).toHaveBeenCalledWith(USER_ID, { passwordHash: hashPassword('newpassword'), emailVerified: true });
    expect(tokens.invalidateAll).toHaveBeenCalledWith(USER_ID, 'reset_password');
  });
});
