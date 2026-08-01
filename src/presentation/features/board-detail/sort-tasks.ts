import type { Task } from "@/domain/entities/task";

export type TaskSortMode =
  | "manual"
  | "title-asc"
  | "title-desc"
  | "created-newest"
  | "created-oldest"
  | "updated-newest"
  | "updated-oldest";

export const TASK_SORT_OPTIONS: Array<{ value: TaskSortMode; label: string }> = [
  { value: "manual", label: "Manual order" },
  { value: "title-asc", label: "Title (A–Z)" },
  { value: "title-desc", label: "Title (Z–A)" },
  { value: "created-newest", label: "Newest first" },
  { value: "created-oldest", label: "Oldest first" },
  { value: "updated-newest", label: "Recently updated" },
  { value: "updated-oldest", label: "Least recently updated" },
];

/**
 * Sorts a column's tasks for display. `"manual"` returns the given (drag-ordered) list
 * untouched — every other mode is a pure display transform layered on top of it, since there's
 * no backend field to persist a chosen sort as the column's real order.
 */
export function sortTasks(tasks: Task[], mode: TaskSortMode): Task[] {
  if (mode === "manual") {
    return tasks;
  }

  const sorted = [...tasks];
  switch (mode) {
    case "title-asc":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "title-desc":
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "created-newest":
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "created-oldest":
      sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      break;
    case "updated-newest":
      sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      break;
    case "updated-oldest":
      sorted.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
      break;
  }
  return sorted;
}
