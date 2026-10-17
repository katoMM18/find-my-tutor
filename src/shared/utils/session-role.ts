export type SessionRole = 'teacher' | 'student';

export function isSessionRole(role: string | undefined): role is SessionRole {
  return role === 'teacher' || role === 'student';
}
