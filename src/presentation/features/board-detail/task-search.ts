import type { Task } from "@/domain/entities/task";

/** Case-insensitive instant search over a task's title and description. Empty query matches everything. */
export function taskMatchesSearch(task: Task, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }
  return (
    task.title.toLowerCase().includes(normalizedQuery) ||
    (task.description ?? "").toLowerCase().includes(normalizedQuery)
  );
}
