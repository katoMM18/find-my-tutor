# T04 — Teacher availability

**Status:** done

## Goal

Model recurring weekly availability and one-time date exceptions in a way
that supports future bookings and timezone conversion.

## Implementation steps

- Add availability schemas for weekly rules and date exceptions.
- Add ownership-safe CRUD service and API routes.
- Add teacher calendar editor for available and unavailable ranges.
- Add student-facing availability preview with timezone labels.
- Add overlap and invalid-range validation.
- Booking-specific exception management remains intentionally separate from
  this MVP availability editor.

## Acceptance criteria

- Teachers can define recurring and exception periods.
- Students can view availability before contacting a teacher.
- Invalid or overlapping ranges are rejected.
