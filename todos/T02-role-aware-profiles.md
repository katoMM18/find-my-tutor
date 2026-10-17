# T02 — Role-aware profiles

**Status:** done

## Goal

Create teacher and student profiles with ownership-safe editing and the MVP
fields from PRODUCT.md.

## Implementation steps

- Add profile schemas, repositories, services, API routes, and tests.
- Add teacher profile fields: bio, subjects, experience, education,
  certificates, licenses, and qualifications.
- Add student profile fields: bio and learning subjects.
- Add profile edit forms with Zod validation and role-aware dashboard entry.
- Add profile completeness and public/private field rules.
- Certificate and license document references are modeled; secure document
  upload is tracked separately in T08.

## Acceptance criteria

- A user can create and edit only their own profile.
- Teacher and student profile fields cannot be mixed.
- Public teacher profile data is readable without exposing private documents.
