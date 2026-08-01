# Backend extensions needed for the full Kanban spec

The frontend was asked to become a full Trello-style board (priority, labels, checklists,
comments, attachments, assignee, due dates, time tracking, activity log, notifications, an
analytics dashboard, and persisted drag-and-drop). Against the API documented in
`Project_Backend_descriptions.md`, none of the following can be saved anywhere today — every
field below is either missing entirely or the endpoint needed to change it doesn't exist. This
is the concrete list to hand to whoever owns the backend; once an item ships, its frontend half
is a comparatively small follow-up (the client-side ordering/drag logic already exists and only
needs a real persistence call swapped in — see `use-board-task-order.ts` and
`use-reorderable-columns.ts`).

## 1. Persisted ordering (highest priority — blocks real drag-and-drop)

- `PUT /api/v1/boards/{board_identifier}/columns/order` (or similar) accepting an ordered list of
  `column_identifier`s, persisting `column_display_order` for each.
- `PUT /api/v1/columns/{column_identifier}/tasks/order` accepting an ordered list of
  `task_identifier`s, persisting `task_position_value` for each.
- `PUT /api/v1/tasks/{task_identifier}/move` (or extend `TaskUpdateRequestSchema`) accepting a
  target `column_identifier` (+ optional target position), so a task can change columns at all.
  Right now `TaskUpdateRequestSchema` only has `task_title`/`task_description` — there is no way
  to move a task server-side, full stop.

Without these three, all reordering and cross-column moves in the UI are client-side-only and
are lost on every page reload.

## 2. Task Card fields

None of the following exist on `TaskResponseSchema` / `TaskCreationRequestSchema` /
`TaskUpdateRequestSchema` today:

| Field                                           | Suggested shape                                                                                                                                                      |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `priority`                                      | enum: `low` \| `medium` \| `high` \| `critical`                                                                                                                      |
| `status`                                        | currently implied by column membership — keep as-is unless a status independent of column is genuinely wanted                                                        |
| `labels`                                        | `label_identifier[]`, referencing a new labels resource (see §3)                                                                                                     |
| `due_date`                                      | ISO 8601 datetime, nullable                                                                                                                                          |
| `assignee_identifier`                           | nullable `user_identifier` — implies boards need a notion of members/collaborators, which doesn't exist yet either (today a board has exactly one owner, no sharing) |
| `estimated_time_minutes` / `time_spent_minutes` | integers, nullable                                                                                                                                                   |
| `is_archived`                                   | boolean — needed for Archive/Restore; without it, "deleted" is the only way to remove a card from view, and it's irreversible                                        |

## 3. New resources

- **Labels**: `POST/GET/PUT/DELETE /api/v1/boards/{board_identifier}/labels` — `label_identifier`,
  `label_name`, `label_color`. Referenced by tasks via `labels: label_identifier[]`.
- **Checklists**: `POST/GET/PUT/DELETE /api/v1/tasks/{task_identifier}/checklists`, each with
  nested items (`checklist_item_identifier`, `item_text`, `is_complete`). Progress percentage is
  a pure client-side derivation once this exists.
- **Comments**: `POST/GET/PUT/DELETE /api/v1/tasks/{task_identifier}/comments` —
  `comment_identifier`, `author_user_identifier`, `body_text`, `created_at`, `updated_at`. Mentions
  need either a `mentioned_user_identifiers[]` field or client-side parsing of `@name` against a
  board's member list (which, again, doesn't exist yet — see assignee above).
- **Attachments**: `POST /api/v1/tasks/{task_identifier}/attachments` (multipart upload) +
  `GET/DELETE`, returning a `file_url`, `file_name`, `file_size_bytes`, `uploaded_at`. This also
  implies object storage (S3-compatible or similar) behind the API.
- **Activity log**: `GET /api/v1/boards/{board_identifier}/activity` — append-only, server-written
  whenever any of the above mutates (column rename, task moved, comment added, etc.). This should
  be generated by the backend itself as a side effect of each mutation, not reconstructed by the
  frontend from timestamps.
- **Board membership**: without this, "assignee", "mentions", and "notify user X" have no list of
  candidate users to pick from. Minimum shape: `POST/GET/DELETE
/api/v1/boards/{board_identifier}/members` referencing existing `user_identifier`s.

## 4. Notifications

Requires board membership (§3) to know who to notify, plus either:

- a polling endpoint (`GET /api/v1/notifications`, marking read via `PATCH`), or
- a push channel (WebSocket/SSE) if real-time delivery is wanted.

Triggers (assigned, mentioned, due-soon, completed, column-changed) are server-side concerns —
the backend already has the mutation point for each (task update, comment create, etc.) and
should emit the notification there, not have the frontend infer it from polling diffs.

## 5. Dashboard / analytics

Either:

- expose enough raw data (all tasks across all boards, with `is_archived`/`completed_at`/
  `priority`/`assignee_identifier` from §2) for the frontend to aggregate locally, or
- add dedicated aggregate endpoints (`GET /api/v1/boards/{board_identifier}/stats`) if the data
  volume makes client-side aggregation impractical.

`completed_at` specifically doesn't exist — "completed" today is not a task attribute, only an
inference from which column a task sits in, which is unreliable once column names are
user-defined and arbitrary.

## What the frontend already does within today's constraints

- Full CRUD on boards/columns/tasks (title + description only), with per-field 422 validation
  error surfacing.
- Client-side-only drag-and-drop (column reorder, task reorder, task move between columns),
  clearly flagged in the UI as unsaved.
- Instant client-side search and per-column sort over title/description/timestamps.
- Column collapse/expand, task duplication (via real `POST` — this one _is_ persisted).
- Dark/light theme, loading skeletons, keyboard shortcut (`/` to search).

Once any item above ships, the corresponding frontend piece is additive, not a rewrite — the
local-only state (`useBoardTaskOrder`, `useReorderableColumns`) is already shaped like the real
persisted version and mainly needs its mutation calls pointed at a real endpoint.
