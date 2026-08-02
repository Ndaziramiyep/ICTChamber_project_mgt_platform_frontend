import type { AxiosInstance } from "axios";

import type { Task, TaskDraft } from "@/domain/entities/task";
import type { TaskRepositionTarget, TaskRepository } from "@/domain/repositories/task-repository";
import { mapTaskResponse } from "@/infrastructure/repositories/mappers";
import type { TaskResponseSchema } from "@/infrastructure/repositories/wire-schemas";

/** Implements {@link TaskRepository} against `/api/v1/columns/{columnId}/tasks` and `/api/v1/tasks/*`. */
export class HttpTaskRepository implements TaskRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async listTasksByColumn(columnId: string): Promise<Task[]> {
    const response = await this.httpClient.get<TaskResponseSchema[]>(
      `/api/v1/columns/${columnId}/tasks`,
    );
    return response.data.map(mapTaskResponse);
  }

  async getTaskById(taskId: string): Promise<Task> {
    const response = await this.httpClient.get<TaskResponseSchema>(`/api/v1/tasks/${taskId}`);
    return mapTaskResponse(response.data);
  }

  async createTask(columnId: string, draft: TaskDraft): Promise<Task> {
    const response = await this.httpClient.post<TaskResponseSchema>(
      `/api/v1/columns/${columnId}/tasks`,
      { task_title: draft.title, task_description: draft.description ?? null },
    );
    return mapTaskResponse(response.data);
  }

  async updateTask(taskId: string, draft: TaskDraft): Promise<Task> {
    const response = await this.httpClient.put<TaskResponseSchema>(`/api/v1/tasks/${taskId}`, {
      task_title: draft.title,
      task_description: draft.description ?? null,
    });
    return mapTaskResponse(response.data);
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.httpClient.delete(`/api/v1/tasks/${taskId}`);
  }

  async repositionTask(taskId: string, target: TaskRepositionTarget): Promise<Task> {
    const response = await this.httpClient.patch<TaskResponseSchema>(
      `/api/v1/tasks/${taskId}/position`,
      {
        target_column_identifier: target.targetColumnId,
        previous_task_identifier: target.previousTaskId ?? null,
        next_task_identifier: target.nextTaskId ?? null,
      },
    );
    return mapTaskResponse(response.data);
  }
}
