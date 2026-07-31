import type { Task, TaskDraft } from "@/domain/entities/task";

/** Port for `/api/v1/columns/{columnId}/tasks` and `/api/v1/tasks/*` endpoints. */
export interface TaskRepository {
  listTasksByColumn(columnId: string): Promise<Task[]>;
  getTaskById(taskId: string): Promise<Task>;
  createTask(columnId: string, draft: TaskDraft): Promise<Task>;
  updateTask(taskId: string, draft: TaskDraft): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
}
