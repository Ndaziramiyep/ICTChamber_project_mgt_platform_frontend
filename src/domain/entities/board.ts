/** A Kanban board owned by a single user. */
export interface Board {
  boardId: string;
  owningUserId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BoardDraft {
  title: string;
  description?: string | null;
}
