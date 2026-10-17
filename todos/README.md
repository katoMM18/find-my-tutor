# TutorConnect implementation tickets

Product source: [`PRODUCT.md`](../PRODUCT.md)

Work through tickets in order. Each ticket states its goal, implementation
steps, acceptance criteria, and verification command. A ticket is `todo`,
`in-progress`, or `done`.

## Delivery order

1. [T01 — Teacher/student authentication](./T01-auth-roles.md) — done
2. [T02 — Role-aware profiles](./T02-role-aware-profiles.md) — done
3. [T03 — Teacher discovery](./T03-teacher-discovery.md) — done
4. [T04 — Teacher availability](./T04-teacher-availability.md) — done
5. [T05 — Rating requests and reviews](./T05-rating-reviews.md) — done
6. [T06 — One-to-one chat](./T06-chat.md) — done
7. [T07 — VIP visibility](./T07-vip.md) — done
8. [T08 — Cloudinary uploads and document access](./T08-cloudinary.md) — done

## Product rules carried through every ticket

- Teacher and student data must stay separated by role and ownership.
- Ratings are immutable after submission.
- Sensitive qualification documents are never public by URL alone.
- Services return `{ data, status }`; repositories own database queries.
- Every feature remains inside the existing feature-based folder structure.
