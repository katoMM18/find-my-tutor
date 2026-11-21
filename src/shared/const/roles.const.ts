// Every account has exactly one role. 'teacher' is shown as "Tutor" in the interface.
// Admins can open /admin. Sign-up only offers student and teacher; admin is given from the admin panel or MongoDB.
export const ACCOUNT_ROLES = ['student', 'teacher', 'admin'] as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[number];

// Legacy extra permissions on top of the role, granted by hand in MongoDB before admin became a role:
// db.users.updateOne({ email: 'you@example.com' }, { $addToSet: { roles: 'admin' } })
export const USER_ROLES = ['admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];
