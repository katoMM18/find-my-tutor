# T01 — Teacher/student authentication

**Status:** done

## Goal

Let a new user choose `teacher` or `student` at registration and preserve that
role through the user record, credentials login, OAuth fallback, session, and
dashboard routing.

## Implementation steps

- [x] Replace starter `user/admin` role vocabulary with product roles.
- [x] Add role validation and a role choice to registration.
- [x] Persist the selected role during registration.
- [x] Expose the role in the typed auth user and NextAuth session.
- [x] Send both roles to the protected dashboard.
- [ ] Add role-specific dashboard content in T02.

## Acceptance criteria

- Registration rejects values other than `teacher` and `student`.
- Registration stores the selected role.
- Credentials login returns the stored role.
- Session refresh keeps the stored role.
- Teacher and student both reach `/dashboard`.

## Verification

```bash
npm run typecheck
npx vitest run src/features/auth/service/auth.service.spec.ts
npx vitest run src/app/api/auth/register/route.spec.ts
npm run lint
```
