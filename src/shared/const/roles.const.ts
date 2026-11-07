// Extra permissions on top of the teacher/student role, granted by hand in MongoDB:
// db.users.updateOne({ email: 'you@example.com' }, { $addToSet: { roles: 'admin' } })
export const USER_ROLES = ['admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];
