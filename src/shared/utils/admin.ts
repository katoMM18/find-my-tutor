import { type UserRole } from '@/shared/const/roles.const';

type SessionUserWithRoles = { isAdmin?: boolean } | null | undefined;

// True when the user's MongoDB document lists the role. Used by the jwt callback.
export function hasRole(roles: readonly string[] | null | undefined, role: UserRole): boolean {
  return roles?.includes(role) ?? false;
}

// An account is an admin when its role is 'admin', or when it carries the legacy 'admin' extra role.
export function isAdminAccount(role: string | null | undefined, roles: readonly string[] | null | undefined): boolean {
  return role === 'admin' || hasRole(roles, 'admin');
}

// Reads the admin flag the jwt callback put on the session (refreshed from the database on every request).
export function isAdminSession(user: SessionUserWithRoles): boolean {
  return user?.isAdmin === true;
}
