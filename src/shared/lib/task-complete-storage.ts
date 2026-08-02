const STORAGE_KEY_PREFIX = "ictchamber.task-complete.";

/**
 * Remembers a task's "complete" checkbox in `localStorage`, keyed by task id. This is purely a
 * client-side convenience — the backend has no `completed` field on tasks yet (see
 * `BACKEND_EXTENSIONS_NEEDED.md`) — but without it, the checkbox forgot its state on every page
 * reload, which read as broken rather than "not yet backed by the server."
 */
export function readIsTaskComplete(taskId: string): boolean {
  return localStorage.getItem(`${STORAGE_KEY_PREFIX}${taskId}`) === "true";
}

export function writeIsTaskComplete(taskId: string, isComplete: boolean): void {
  if (isComplete) {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${taskId}`, "true");
  } else {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${taskId}`);
  }
}
