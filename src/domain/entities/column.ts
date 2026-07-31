/** A column (swimlane) within a Kanban board. */
export interface KanbanColumn {
  columnId: string;
  parentBoardId: string;
  title: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnDraft {
  title: string;
}
