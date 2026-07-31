import type {
  BoardResponseSchema,
  ColumnResponseSchema,
  TaskResponseSchema,
  UserProfileResponseSchema,
} from "@/infrastructure/repositories/wire-schemas";

export function buildUserProfileFixture(
  overrides: Partial<UserProfileResponseSchema> = {},
): UserProfileResponseSchema {
  return {
    user_identifier: "user-1",
    email_address: "jane@example.com",
    display_name: "Jane Doe",
    account_created_at: "2026-01-01T00:00:00Z",
    is_account_active: true,
    ...overrides,
  };
}

export function buildBoardFixture(
  overrides: Partial<BoardResponseSchema> = {},
): BoardResponseSchema {
  return {
    board_identifier: "board-1",
    owning_user_identifier: "user-1",
    board_title: "Sprint 12",
    board_description: "Backend sprint board",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

export function buildColumnFixture(
  overrides: Partial<ColumnResponseSchema> = {},
): ColumnResponseSchema {
  return {
    column_identifier: "column-1",
    parent_board_identifier: "board-1",
    column_title: "In Progress",
    column_display_order: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

export function buildTaskFixture(overrides: Partial<TaskResponseSchema> = {}): TaskResponseSchema {
  return {
    task_identifier: "task-1",
    parent_column_identifier: "column-1",
    parent_board_identifier: "board-1",
    task_title: "Wire up login form",
    task_description: "Use the /auth/login endpoint",
    task_position_value: 100,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}
