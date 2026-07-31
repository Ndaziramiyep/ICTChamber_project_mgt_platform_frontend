/** Centralized TanStack Query cache keys so invalidation stays consistent across hooks. */
export const queryKeys = {
  boards: {
    all: ["boards"] as const,
    detail: (boardId: string) => ["boards", boardId] as const,
  },
  columns: {
    byBoard: (boardId: string) => ["boards", boardId, "columns"] as const,
    detail: (columnId: string) => ["columns", columnId] as const,
  },
  tasks: {
    byColumn: (columnId: string) => ["columns", columnId, "tasks"] as const,
    detail: (taskId: string) => ["tasks", taskId] as const,
  },
  session: {
    currentUser: ["session", "current-user"] as const,
  },
};
