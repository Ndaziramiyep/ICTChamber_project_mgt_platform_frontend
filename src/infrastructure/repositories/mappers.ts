import type { Board } from "@/domain/entities/board";
import type { KanbanColumn } from "@/domain/entities/column";
import type { Task } from "@/domain/entities/task";
import type { User } from "@/domain/entities/user";
import type {
  BoardResponseSchema,
  ColumnResponseSchema,
  TaskResponseSchema,
  UserProfileResponseSchema,
} from "@/infrastructure/repositories/wire-schemas";

export function mapUserResponse(wire: UserProfileResponseSchema): User {
  return {
    userId: wire.user_identifier,
    emailAddress: wire.email_address,
    displayName: wire.display_name,
    accountCreatedAt: wire.account_created_at,
    isAccountActive: wire.is_account_active,
  };
}

export function mapBoardResponse(wire: BoardResponseSchema): Board {
  return {
    boardId: wire.board_identifier,
    owningUserId: wire.owning_user_identifier,
    title: wire.board_title,
    description: wire.board_description,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
}

export function mapColumnResponse(wire: ColumnResponseSchema): KanbanColumn {
  return {
    columnId: wire.column_identifier,
    parentBoardId: wire.parent_board_identifier,
    title: wire.column_title,
    displayOrder: wire.column_display_order,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
}

export function mapTaskResponse(wire: TaskResponseSchema): Task {
  return {
    taskId: wire.task_identifier,
    parentColumnId: wire.parent_column_identifier,
    parentBoardId: wire.parent_board_identifier,
    title: wire.task_title,
    description: wire.task_description,
    positionValue: wire.task_position_value,
    createdAt: wire.created_at,
    updatedAt: wire.updated_at,
  };
}
