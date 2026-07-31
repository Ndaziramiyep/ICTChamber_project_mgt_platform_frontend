import type { AxiosInstance } from "axios";

import type { ColumnDraft, KanbanColumn } from "@/domain/entities/column";
import type { ColumnRepository } from "@/domain/repositories/column-repository";
import { mapColumnResponse } from "@/infrastructure/repositories/mappers";
import type { ColumnResponseSchema } from "@/infrastructure/repositories/wire-schemas";

/** Implements {@link ColumnRepository} against `/api/v1/boards/{boardId}/columns` and `/api/v1/columns/*`. */
export class HttpColumnRepository implements ColumnRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async listColumnsByBoard(boardId: string): Promise<KanbanColumn[]> {
    const response = await this.httpClient.get<ColumnResponseSchema[]>(
      `/api/v1/boards/${boardId}/columns`,
    );
    return response.data.map(mapColumnResponse);
  }

  async getColumnById(columnId: string): Promise<KanbanColumn> {
    const response = await this.httpClient.get<ColumnResponseSchema>(`/api/v1/columns/${columnId}`);
    return mapColumnResponse(response.data);
  }

  async createColumn(boardId: string, draft: ColumnDraft): Promise<KanbanColumn> {
    const response = await this.httpClient.post<ColumnResponseSchema>(
      `/api/v1/boards/${boardId}/columns`,
      { column_title: draft.title },
    );
    return mapColumnResponse(response.data);
  }

  async updateColumn(columnId: string, draft: ColumnDraft): Promise<KanbanColumn> {
    const response = await this.httpClient.put<ColumnResponseSchema>(
      `/api/v1/columns/${columnId}`,
      {
        column_title: draft.title,
      },
    );
    return mapColumnResponse(response.data);
  }

  async deleteColumn(columnId: string): Promise<void> {
    await this.httpClient.delete(`/api/v1/columns/${columnId}`);
  }
}
