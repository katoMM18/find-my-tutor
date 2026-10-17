# T06 — One-to-one chat

**Status:** done

## Goal

Give students and teachers a simple private conversation with history and
read state.

## Implementation steps

- Add conversation and message schemas with participant ownership.
- Add conversation/message services and API routes.
- Add conversation list, message history, send, and read actions.
- Add responsive chat UI and unread indicators.
- Add block/report checks before sending.
- Block/report is reserved for the trust-and-safety expansion; participant
  authorization is enforced for every chat operation in this MVP.

## Acceptance criteria

- Only conversation participants can read or send messages.
- Message history is ordered and paginated.
- Read state updates and unread counts are consistent.
