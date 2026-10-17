# T07 — VIP visibility

**Status:** done

## Goal

Add VIP, VIP+, and SUPER VIP statuses with expiration and predictable
discovery ranking.

## Implementation steps

- [x] Add VIP subscription schema and status constants.
- [x] Add status activation, expiration, and lookup services.
- [x] Add ranking rules that never hide non-VIP teachers.
- [x] Add status badges and teacher visibility indicators.
- [x] Leave payment integration behind a service boundary for later.

## Acceptance criteria

- Expired status stops affecting ranking.
- VIP changes ordering but does not remove teachers from discovery.
- Status is visible on teacher cards and profiles.
