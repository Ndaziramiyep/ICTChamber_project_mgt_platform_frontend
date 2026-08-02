import type { Task, TaskDraft } from "@/domain/entities/task";

/**
 * Where a task should land: `targetColumnId` it should belong to, and the siblings it should end
 * up between in that column (either may be omitted/null for "top of column" / "bottom of column").
 */
export interface TaskRepositionTarget {
  targetColumnId: string;
  previousTaskId?: string | null;
  nextTaskId?: string | null;
}

/** Port for `/api/v1/columns/{columnId}/tasks` and `/api/v1/tasks/*` endpoints. */
export interface TaskRepository {
  listTasksByColumn(columnId: string): Promise<Task[]>;
  getTaskById(taskId: string): Promise<Task>;
  createTask(columnId: string, draft: TaskDraft): Promise<Task>;
  updateTask(taskId: string, draft: TaskDraft): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
  /** Moves a task to a new column and/or a new position among its siblings there. */
  repositionTask(taskId: string, target: TaskRepositionTarget): Promise<Task>;
}
