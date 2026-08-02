# ICT Chamber Kanban — Frontend

A React + TypeScript single-page app for the ICT Chamber Kanban project management platform.
It provides JWT-based authentication and a Board → Column → Task Kanban workspace with
drag-and-drop, built against the FastAPI backend described in
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

## Features

- **Authentication** — register, log in, and stay signed in via JWT access/refresh tokens, with
  automatic silent refresh-and-retry on an expired access token.
- **Boards** — create, rename, and delete boards from a personal boards list.
- **Columns & tasks** — create, edit, and delete columns and tasks within a board.
- **Drag-and-drop** — reorder tasks within a column, move tasks between columns, and reorder
  columns themselves, powered by `@dnd-kit`. See [Known limitations](#known-limitations) for
  what this does (and doesn't) persist.
- **Task search** — filter the tasks on a board as you type.
- **Form validation** — every create/edit form is validated client-side with React Hook Form and
  Zod before it reaches the API.

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

The backend does not yet expose endpoints to persist column order, task order, or a task's
column (see `Project_Backend_descriptions.md`): `GET /boards/{id}/columns` and each column's
task list are always returned in creation order. To make the board still feel interactive,
drag-and-drop reordering is implemented **client-side only** (`use-reorderable-columns.ts`,
`use-board-task-order.ts`) — moves are reflected immediately in the UI but are **not saved**,
and reset to server (creation) order on a page reload.
