/** A task belonging to a column (and transitively to a board). */
export interface Task {
  taskId: string;
  parentColumnId: string;
  parentBoardId: string;
  title: string;
  description: string | null;
  positionValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDraft {
  title: string;
  description?: string | null;
}
