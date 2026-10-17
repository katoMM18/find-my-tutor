# T05 — Rating requests and reviews

**Status:** done

## Goal

Implement the explicit request → teacher approval → immutable student rating
flow.

## Implementation steps

- Add rating request and rating schemas with unique request usage.
- Add request, approve, submit, and read services with ownership checks.
- Add API routes and notification events for each state transition.
- Add student rating form and teacher approval queue.
- Calculate aggregate rating and review count from immutable submissions.
- Add expiration handling for pending requests.
- Ratings are immutable by schema and only approved requests can submit.

## Acceptance criteria

- A student cannot rate without teacher approval.
- A request cannot produce more than one rating.
- Neither party can edit or delete a submitted rating.
- Pending requests expire according to the product rule.
