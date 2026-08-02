import type { ColumnDraft, KanbanColumn } from "@/domain/entities/column";

/** Port for `/api/v1/boards/{boardId}/columns` and `/api/v1/columns/*` endpoints. */
export interface ColumnRepository {
  listColumnsByBoard(boardId: string): Promise<KanbanColumn[]>;
  getColumnById(columnId: string): Promise<KanbanColumn>;
  createColumn(boardId: string, draft: ColumnDraft): Promise<KanbanColumn>;
  updateColumn(columnId: string, draft: ColumnDraft): Promise<KanbanColumn>;
  deleteColumn(columnId: string): Promise<void>;
  /** Persists a full new left-to-right order for every column on the board. */
  reorderColumns(boardId: string, orderedColumnIds: string[]): Promise<KanbanColumn[]>;
}
