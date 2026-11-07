import { randomBytes } from 'crypto';

import { authTokenRepository } from '@/features/auth/repository/auth-token.repository';
import { userRepository } from '@/features/auth/repository/user.repository';
import { appUrl, sendPasswordResetEmail } from '@/features/auth/service/auth-email.service';
import { ResetPasswordType } from '@/features/auth/validations/auth.validation';
import { type Locale } from '@/shared/const/i18n.const';
import { ServiceResult } from '@/shared/types/common';
import { hashPassword, hashToken } from '@/shared/utils/password';

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
export const RESET_REQUEST_COOLDOWN_MS = 60 * 1000;

// Always answers the same way, so the form can't be used to find out which emails have accounts.
export async function requestPasswordResetService(email: string, locale: Locale): Promise<ServiceResult<{ sent: true }>> {
  const user = await userRepository.findByEmail(email.trim());
  if (!user) return { data: { sent: true }, status: 200 };

  const userId = user._id.toString();
  const latest = await authTokenRepository.findLatestActive(userId, 'reset_password');
  if (latest && Date.now() - latest.createdAt.getTime() < RESET_REQUEST_COOLDOWN_MS) {
    return { data: { sent: true }, status: 200 };
  }

  const token = randomBytes(32).toString('base64url');
  await authTokenRepository.invalidateAll(userId, 'reset_password');
  await authTokenRepository.create({
    userId,
    purpose: 'reset_password',
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });
  await sendPasswordResetEmail({ email: user.email, name: user.name }, appUrl(`/reset-password?token=${token}`), locale);

  return { data: { sent: true }, status: 200 };
}

// Sets the new password from a valid link. Opening the link proves the inbox, so the email also counts as verified.
export async function resetPasswordService(input: ResetPasswordType): Promise<ServiceResult<{ reset: true }>> {
  const token = await authTokenRepository.findActiveByHash(hashToken(input.token), 'reset_password');
  if (!token) return { data: { error: 'INVALID_TOKEN' }, status: 400 };

  const userId = token.userId.toString();
  await userRepository.updateById(userId, { passwordHash: hashPassword(input.password), emailVerified: true });
  await authTokenRepository.invalidateAll(userId, 'reset_password');

  return { data: { reset: true }, status: 200 };
}
