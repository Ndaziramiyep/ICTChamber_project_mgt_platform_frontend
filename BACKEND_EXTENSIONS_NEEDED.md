# Backend Extensions Needed

## Purpose

The frontend was asked to become a full Trello-style board: priority, labels, checklists,
comments, attachments, assignees, due dates, time tracking, an activity log, notifications, and
an analytics dashboard. Measured against the API documented in
[`Project_Backend_descriptions.md`](./Project_Backend_descriptions.md), none of this can be saved
today — every field or action below is either missing from the schema or has no endpoint to
change it.

This document is the concrete backlog to hand to whoever owns the backend. It is organized by
priority, not by how the frontend happens to be structured. Once an item ships, its frontend half
is often a comparatively small follow-up — the same pattern used for persisted drag-and-drop
(below) applies: keep the existing client-side ordering/optimistic-update logic and just point
its mutation calls at a real endpoint.

## Shipped

- **Persisted drag-and-drop** — `PUT /api/v1/boards/{id}/columns/reorder` and
  `PATCH /api/v1/tasks/{id}/position` now exist and are wired up on the frontend
  (`useReorderColumnsMutation`, `useRepositionTaskMutation`). Column reorders and task
  moves/reorders (including cross-column) persist and survive a page reload; a failed save
  reverts the board to the last known-good order and shows an error toast. This was the P0 item
  blocking real drag-and-drop — see `Project_Backend_descriptions.md` for the request/response
  shapes.

## Priority summary

| #   | Area                  | Priority | Why                                                                |
| --- | --------------------- | -------- | ------------------------------------------------------------------ |
| 1   | Task card fields      | P1       | Blocks priority, labels, due dates, assignees, archiving on cards  |
| 2   | New resources         | P1       | Blocks labels, checklists, comments, attachments, board membership |
| 3   | Notifications         | P2       | Depends on board membership (§2) existing first                    |
| 4   | Dashboard / analytics | P2       | Depends on task fields (§1) existing first                         |

---

## 1. Task card fields (P1)

None of the following exist on `TaskResponseSchema`, `TaskCreationRequestSchema`, or
`TaskUpdateRequestSchema` today:

| Field                                           | Suggested shape                                                                                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `priority`                                      | enum: `low` / `medium` / `high` / `critical`                                                                                                                        |
| `status`                                        | currently implied by column membership; keep as-is unless a status independent of column is genuinely needed                                                        |
| `labels`                                        | `label_identifier[]`, referencing a new labels resource (see resources section below)                                                                               |
| `due_date`                                      | ISO 8601 datetime, nullable                                                                                                                                         |
| `assignee_identifier`                           | nullable `user_identifier`; implies boards need a notion of members/collaborators, which doesn't exist yet either (today a board has exactly one owner, no sharing) |
| `estimated_time_minutes` / `time_spent_minutes` | integers, nullable                                                                                                                                                  |
| `is_archived`                                   | boolean; needed for archive/restore. Without it, deletion is the only way to remove a card from view, and it's irreversible                                         |

## 2. New resources (P1)

- **Labels** — `POST/GET/PUT/DELETE /api/v1/boards/{board_identifier}/labels`:
  `label_identifier`, `label_name`, `label_color`. Referenced by tasks via
  `labels: label_identifier[]`.
- **Checklists** — `POST/GET/PUT/DELETE /api/v1/tasks/{task_identifier}/checklists`, each with
  nested items (`checklist_item_identifier`, `item_text`, `is_complete`). Progress percentage is
  a pure client-side derivation once this exists.
- **Comments** — `POST/GET/PUT/DELETE /api/v1/tasks/{task_identifier}/comments`:
  `comment_identifier`, `author_user_identifier`, `body_text`, `created_at`, `updated_at`.
  Mentions need either a `mentioned_user_identifiers[]` field or client-side parsing of `@name`
  against a board's member list (which, again, doesn't exist yet — see assignees above).
- **Attachments** — `POST /api/v1/tasks/{task_identifier}/attachments` (multipart upload) plus
  `GET`/`DELETE`, returning `file_url`, `file_name`, `file_size_bytes`, `uploaded_at`. This also
  implies object storage (S3-compatible or similar) behind the API.
- **Activity log** — `GET /api/v1/boards/{board_identifier}/activity`, append-only and
  server-written whenever any of the above mutates (column renamed, task moved, comment added,
  etc.). This should be generated by the backend as a side effect of each mutation, not
  reconstructed by the frontend from timestamps.
- **Board membership** — without this, "assignee," "mentions," and "notify user X" have no list
  of candidate users to choose from. Minimum shape:
  `POST/GET/DELETE /api/v1/boards/{board_identifier}/members`, referencing existing
  `user_identifier`s.

## 3. Notifications (P2)

Requires board membership (§2) to know who to notify, plus either:

- a polling endpoint (`GET /api/v1/notifications`, marked read via `PATCH`), or
- a push channel (WebSocket/SSE) if real-time delivery is wanted.

Triggers (assigned, mentioned, due-soon, completed, column-changed) are server-side concerns —
the backend already has the mutation point for each (task update, comment create, etc.) and
should emit the notification there rather than have the frontend infer it from polling diffs.

## 4. Dashboard / analytics (P2)

Either:

- expose enough raw data (all tasks across all boards, with `is_archived`, `completed_at`,
  `priority`, and `assignee_identifier` from §1) for the frontend to aggregate locally, or
- add dedicated aggregate endpoints (`GET /api/v1/boards/{board_identifier}/stats`) if data
  volume makes client-side aggregation impractical.

`completed_at` specifically doesn't exist today — "completed" is not a task attribute, only an
inference from which column a task sits in, which is unreliable once column names are
user-defined and arbitrary.

---

## Current frontend capabilities (within today's API constraints)

- Full CRUD on boards, columns, and tasks (title + description only), with per-field 422
  validation errors surfaced to the user.
- Persisted drag-and-drop (column reorder, task reorder, task move between columns) — see
  [Shipped](#shipped) above.
- Instant client-side search and per-column sort over title, description, and timestamps.
- Column collapse/expand and task duplication (via a real `POST` — this one _is_ persisted).
- Loading skeletons and a keyboard shortcut (`/`) to focus search.

Once any item above ships, the corresponding frontend piece is often additive rather than a
rewrite — that was true of drag-and-drop, whose local-only ordering state
(`useBoardTaskOrder`, `useReorderableColumns`) only needed its mutation calls pointed at the new
`columns/reorder` and `tasks/{id}/position` endpoints once those existed.
