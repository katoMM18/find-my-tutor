import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/repository/user.repository', () => ({
  userRepository: { findById: vi.fn(), updateById: vi.fn() },
}));

vi.mock('@/features/auth/repository/auth-token.repository', () => ({
  authTokenRepository: {
    findLatestActive: vi.fn(),
    invalidateAll: vi.fn(),
    create: vi.fn(),
    incrementAttempts: vi.fn(),
    markUsed: vi.fn(),
  },
}));

vi.mock('@/features/auth/service/auth-email.service', () => ({
  sendVerificationCodeEmail: vi.fn(),
  sendWelcomeEmail: vi.fn(),
}));

import { authTokenRepository } from '@/features/auth/repository/auth-token.repository';
import { userRepository } from '@/features/auth/repository/user.repository';
import { sendVerificationCodeEmail, sendWelcomeEmail } from '@/features/auth/service/auth-email.service';
import { hashToken } from '@/shared/utils/password';

import { issueVerificationCodeService, verifyEmailService } from './email-verification.service';

const users = vi.mocked(userRepository);
const tokens = vi.mocked(authTokenRepository);
const USER_ID = '507f1f77bcf86cd799439011';
const unverified = { _id: { toString: () => USER_ID }, name: 'Ana', email: 'ana@example.com', role: 'student', emailVerified: false };
const token = (overrides = {}) => ({ _id: { toString: () => 'tok_1' }, tokenHash: hashToken('123456'), attempts: 0, createdAt: new Date(0), ...overrides });

describe('issueVerificationCodeService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('emails a fresh 6-digit code and stores only its hash', async () => {
    users.findById.mockResolvedValueOnce(unverified as never);
    tokens.findLatestActive.mockResolvedValueOnce(null);
    const result = await issueVerificationCodeService(USER_ID, 'en');
    expect(result.status).toBe(200);
    const code = vi.mocked(sendVerificationCodeEmail).mock.calls[0][1];
    expect(code).toMatch(/^\d{6}$/);
    expect(tokens.create).toHaveBeenCalledWith(expect.objectContaining({ purpose: 'verify_email', tokenHash: hashToken(code) }));
  });

  it('refuses a resend within the cooldown', async () => {
    users.findById.mockResolvedValueOnce(unverified as never);
    tokens.findLatestActive.mockResolvedValueOnce(token({ createdAt: new Date() }) as never);
    const result = await issueVerificationCodeService(USER_ID, 'en');
    expect(result.status).toBe(429);
    expect(sendVerificationCodeEmail).not.toHaveBeenCalled();
  });

  it('does nothing for an already verified account', async () => {
    users.findById.mockResolvedValueOnce({ ...unverified, emailVerified: true } as never);
    expect((await issueVerificationCodeService(USER_ID, 'en')).status).toBe(409);
  });
});

describe('verifyEmailService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('verifies with the right code and sends the welcome email', async () => {
    users.findById.mockResolvedValueOnce(unverified as never);
    tokens.findLatestActive.mockResolvedValueOnce(token() as never);
    const result = await verifyEmailService(USER_ID, '123456', 'en');
    expect(result).toEqual({ data: { verified: true }, status: 200 });
    expect(users.updateById).toHaveBeenCalledWith(USER_ID, { emailVerified: true });
    expect(tokens.markUsed).toHaveBeenCalledWith('tok_1');
    expect(sendWelcomeEmail).toHaveBeenCalledOnce();
  });

  it('counts a wrong code as an attempt', async () => {
    users.findById.mockResolvedValueOnce(unverified as never);
    tokens.findLatestActive.mockResolvedValueOnce(token() as never);
    const result = await verifyEmailService(USER_ID, '000000', 'en');
    expect(result.status).toBe(400);
    expect(tokens.incrementAttempts).toHaveBeenCalledWith('tok_1');
    expect(users.updateById).not.toHaveBeenCalled();
  });

  it('locks the code after five wrong attempts', async () => {
    users.findById.mockResolvedValueOnce(unverified as never);
    tokens.findLatestActive.mockResolvedValueOnce(token({ attempts: 5 }) as never);
    expect((await verifyEmailService(USER_ID, '123456', 'en')).status).toBe(429);
  });

  it('reports an expired code', async () => {
    users.findById.mockResolvedValueOnce(unverified as never);
    tokens.findLatestActive.mockResolvedValueOnce(null);
    expect((await verifyEmailService(USER_ID, '123456', 'en')).data).toEqual({ error: 'CODE_EXPIRED' });
  });
});
