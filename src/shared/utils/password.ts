import { createHash } from 'crypto';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// One-time codes and reset tokens are stored hashed, the same way passwords are.
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
