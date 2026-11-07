import { type UserRole } from '@/shared/const/roles.const';

type SessionUserWithRoles = { isAdmin?: boolean } | null | undefined;

// True when the user's MongoDB document lists the role. Used by the jwt callback.
export function hasRole(roles: readonly string[] | null | undefined, role: UserRole): boolean {
  return roles?.includes(role) ?? false;
}

// Reads the admin flag the jwt callback put on the session (refreshed from the database on every request).
export function isAdminSession(user: SessionUserWithRoles): boolean {
  return user?.isAdmin === true;
}
