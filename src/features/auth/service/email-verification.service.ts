import { randomInt } from 'crypto';

import { authTokenRepository } from '@/features/auth/repository/auth-token.repository';
import { userRepository } from '@/features/auth/repository/user.repository';
import { sendVerificationCodeEmail, sendWelcomeEmail } from '@/features/auth/service/auth-email.service';
import { type Locale } from '@/shared/const/i18n.const';
import { ServiceResult } from '@/shared/types/common';
import { hashToken } from '@/shared/utils/password';

export const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000;
export const VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;
export const VERIFICATION_MAX_ATTEMPTS = 5;

// Sends a fresh 6-digit code and retires any earlier one. Refuses if a code went out less than a minute ago.
export async function issueVerificationCodeService(userId: string, locale: Locale): Promise<ServiceResult<{ sent: true }>> {
  const user = await userRepository.findById(userId);
  if (!user) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (user.emailVerified !== false) return { data: { error: 'ALREADY_VERIFIED' }, status: 409 };

  const latest = await authTokenRepository.findLatestActive(userId, 'verify_email');
  if (latest && Date.now() - latest.createdAt.getTime() < VERIFICATION_RESEND_COOLDOWN_MS) {
    return { data: { error: 'TOO_SOON' }, status: 429 };
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
  await authTokenRepository.invalidateAll(userId, 'verify_email');
  await authTokenRepository.create({
    userId,
    purpose: 'verify_email',
    tokenHash: hashToken(code),
    expiresAt: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
  });
  await sendVerificationCodeEmail({ email: user.email, name: user.name }, code, locale);

  return { data: { sent: true }, status: 200 };
}

// Checks the code against the newest active one; five wrong tries burn it. On success the welcome email goes out.
export async function verifyEmailService(userId: string, code: string, locale: Locale): Promise<ServiceResult<{ verified: true }>> {
  const user = await userRepository.findById(userId);
  if (!user) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (user.emailVerified !== false) return { data: { verified: true }, status: 200 };

  const token = await authTokenRepository.findLatestActive(userId, 'verify_email');
  if (!token) return { data: { error: 'CODE_EXPIRED' }, status: 400 };
  if (token.attempts >= VERIFICATION_MAX_ATTEMPTS) return { data: { error: 'TOO_MANY_ATTEMPTS' }, status: 429 };
  if (token.tokenHash !== hashToken(code)) {
    await authTokenRepository.incrementAttempts(token._id.toString());
    return { data: { error: 'INVALID_CODE' }, status: 400 };
  }

  await authTokenRepository.markUsed(token._id.toString());
  await userRepository.updateById(userId, { emailVerified: true });
  await sendWelcomeEmail({ email: user.email, name: user.name }, user.role === 'teacher' ? 'teacher' : 'student', locale);

  return { data: { verified: true }, status: 200 };
}
