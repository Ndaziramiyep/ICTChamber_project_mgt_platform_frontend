# ICT Chamber Kanban — Frontend

A production-quality React + TypeScript single-page app for the ICT Chamber Kanban project
management platform. It provides JWT-based authentication and a Board → Column → Task Kanban
workspace with drag-and-drop, built against the FastAPI backend described in
[`Project_Backend_descriptions.md`](./Project_Backend_descriptions.md).

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Scripts](#scripts)
- [Testing](#testing)
- [Git hooks](#git-hooks)
- [Known limitations](#known-limitations)
- [Project documentation](#project-documentation)

## Features

- **Authentication** — register, log in, and stay signed in via JWT access/refresh tokens, with
  automatic silent refresh-and-retry on an expired access token.
- **Boards** — create, rename, and delete boards from a personal boards list.
- **Columns & tasks** — create, edit, delete, and duplicate columns and tasks within a board, with
  columns collapsible to save space.
- **Drag-and-drop** — reorder tasks within a column, move tasks between columns, and reorder
  columns themselves, powered by `@dnd-kit` (mouse and keyboard). Every move is persisted to the
  backend (`PUT /columns/reorder`, `PATCH /tasks/{id}/position`); a failed save reverts the board
  to its last known-good order and shows an error toast.
- **Search & sort** — instantly filter a board's tasks by title/description (`/` to focus the
  search box), and sort each column's tasks by title or by creation/update time.
- **Form validation** — every create/edit form is validated client-side with React Hook Form and
  Zod before it reaches the API, with per-field error messages surfaced from the backend.

## Tech stack

- **React 19 + TypeScript**, built with **Vite**
- **Tailwind CSS v4** for styling, **Radix UI** primitives for accessible dialogs
- **@dnd-kit** (`core`, `sortable`, `utilities`) for drag-and-drop task and column reordering
- **TanStack Query** for server state (caching, invalidation, loading/error states) + **Axios**
  for HTTP, with a response interceptor that refreshes an expired access token once and retries
- **Zustand** for client-only state (the current user's profile)
- **React Router** for routing, **React Hook Form + Zod** for form state and validation
- **Jest + React Testing Library + MSW** for testing, with ESLint, Prettier, Husky, and
  lint-staged enforcing quality on every commit

## Architecture

The codebase is organized by Clean Architecture layer rather than by page, so business rules
stay framework-agnostic and each layer is testable in isolation:

```text
src/
  domain/           Entities and repository interfaces (ports). No framework dependencies.
  infrastructure/   Axios client + interceptors, localStorage token storage, and the Http*
                     Repository classes that implement the domain ports against the backend API.
  application/      Zustand auth store, the RepositoryProvider (dependency-injection seam), and
                     TanStack Query hooks per resource (auth, boards, columns, tasks).
  presentation/     React components: a shared UI kit (Button, Input, Modal, ...) and feature
                     folders (auth, boards, board-detail, layout) composed into pages.
  shared/           Cross-cutting utilities: env config, validation schemas, small helpers.
test/               Jest setup, MSW mock backend + fixtures, and shared test render helpers.
```

`application/repository-provider.tsx` is the dependency-inversion seam: hooks depend only on the
domain repository interfaces, so tests inject in-memory fakes (`test/support/fake-repositories.ts`)
instead of hitting the network, while the running app wires the real HTTP implementations.

## Prerequisites

- Node.js 20+ and npm
- The backend running locally (see `Project_Backend_descriptions.md`) with this app's origin
  added to its `ALLOWED_CORS_ORIGINS`

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL if the backend isn't at http://127.0.0.1:8000
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Scripts

| Command                 | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server                                |
| `npm run build`         | Type-check and build for production (`dist/`)            |
| `npm run preview`       | Preview the production build locally                     |
| `npm run typecheck`     | Type-check without emitting                              |
| `npm run lint`          | Lint the whole project                                   |
| `npm run lint:fix`      | Lint and auto-fix                                        |
| `npm run format`        | Format the whole project with Prettier                   |
| `npm run format:check`  | Check formatting without writing                         |
| `npm test`              | Run the Jest test suite                                  |
| `npm run test:watch`    | Run tests in watch mode                                  |
| `npm run test:coverage` | Run tests with a coverage report (gated at 90/80/85/90%) |

## Testing

Unit tests sit next to the code they cover (`*.test.ts(x)`); cross-cutting integration tests
live under `test/integration/`. The infrastructure layer (HTTP repositories, the auth-refresh
interceptor) is tested against an in-memory mock backend built with **MSW**
(`test/mocks/handlers.ts`) that mirrors the documented API, including ownership checks and the
uniform error envelope. The application and presentation layers are tested with in-memory fake
repositories (`test/support/fake-repositories.ts`) injected through `RepositoryProvider`, so
component and hook tests never touch the network. `test/integration/app-golden-path.test.tsx`
exercises the real `App.tsx` composition end to end (real HTTP repositories against MSW) to catch
wiring mistakes the isolated unit tests wouldn't.

## Git hooks

Husky runs `lint-staged` (ESLint + Prettier on staged files) on every commit, and typecheck +
the full test suite on every push.

## Known limitations

Drag-and-drop reordering now persists (see [Features](#features)), but a number of
Trello-style features the platform is meant to grow into — labels, checklists, comments,
attachments, assignees, due dates, notifications, and an analytics dashboard — have no backing
fields or endpoints on the backend yet. These are tracked in
[`BACKEND_EXTENSIONS_NEEDED.md`](./BACKEND_EXTENSIONS_NEEDED.md), which also documents what the
frontend already supports within today's API constraints.

## Project documentation

- [`Project_Backend_descriptions.md`](./Project_Backend_descriptions.md) — the backend API
  contract this app is built against.
- [`BACKEND_EXTENSIONS_NEEDED.md`](./BACKEND_EXTENSIONS_NEEDED.md) — backend endpoints and
  resources required to move beyond today's limitations (persisted drag-and-drop, labels,
  checklists, comments, attachments, notifications, analytics).
