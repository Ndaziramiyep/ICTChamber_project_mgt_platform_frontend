import { useMemo, useState } from "react";

import type { Task } from "@/domain/entities/task";

export interface UseBoardTaskOrderResult {
  /** Each column's tasks in their current display order — server order, adjusted by local drags. */
  orderedTasksByColumnId: Record<string, Task[]>;
  /**
   * Moves a task to sit at `targetIndex` within `targetColumnId`, and returns the resulting
   * full task-id order for every column so the caller can persist it in the same tick, without
   * waiting on the state update to flush.
   */
  moveTask: (
    taskId: string,
    targetColumnId: string,
    targetIndex: number,
  ) => Record<string, string[]>;
  /** The column a task currently displays under, accounting for any local (unsaved) move. */
  findColumnIdForTask: (taskId: string) => string | undefined;
  /** Discards any local (unpersisted) moves and snaps back to the server-reported order. */
  resetToServerOrder: () => void;
}

/**
 * Tracks a local display order and column placement for every task on the board, seeded from
 * and reconciled against each column's server-fetched task list. Dragging a task — within a
 * column, or into a different one — updates this local state immediately for instant visual
 * feedback; the caller is responsible for persisting the move (see
 * `PATCH /tasks/{id}/position` in `Project_Backend_descriptions.md`) and for calling
 * `resetToServerOrder` if that persistence fails.
 *
 * Reconciliation only adds tasks that have never been seen before (genuinely new, from
 * `createTask`) and drops tasks no longer present anywhere on the server (deleted). It
 * deliberately does NOT snap a task back to its server-reported column on every background
 * refetch — otherwise an unrelated create/edit elsewhere on the board would undo the user's
 * in-progress local drag.
 */
export function useBoardTaskOrder(
  columnIds: string[],
  tasksByColumnId: Record<string, Task[]>,
): UseBoardTaskOrderResult {
  const [localOrder, setLocalOrder] = useState<Record<string, string[]>>({});

  const taskById = useMemo(
    () =>
      new Map(
        Object.values(tasksByColumnId)
          .flat()
          .map((task) => [task.taskId, task]),
      ),
    [tasksByColumnId],
  );

  // Reconcile server tasks into local order without useEffect:
  // keep local positions, append genuinely new tasks, drop deleted ones
  const reconciledOrder = useMemo(() => {
    const allServerIds = new Set(
      Object.values(tasksByColumnId).flatMap((tasks) => tasks.map((t) => t.taskId)),
    );
    const allLocalIds = new Set(Object.values(localOrder).flat());

    const next: Record<string, string[]> = {};
    for (const columnId of columnIds) {
      const kept = (localOrder[columnId] ?? []).filter((id) => allServerIds.has(id));
      const added = (tasksByColumnId[columnId] ?? [])
        .map((t) => t.taskId)
        .filter((id) => !allLocalIds.has(id));
      next[columnId] = [...kept, ...added];
    }
    return next;
  }, [columnIds, tasksByColumnId, localOrder]);

  function moveTask(
    taskId: string,
    targetColumnId: string,
    targetIndex: number,
  ): Record<string, string[]> {
    const next: Record<string, string[]> = {};
    for (const [columnId, ids] of Object.entries(reconciledOrder)) {
      next[columnId] = ids.filter((id) => id !== taskId);
    }
    const targetIds = [...(next[targetColumnId] ?? [])];
    const clampedIndex = Math.max(0, Math.min(targetIndex, targetIds.length));
    targetIds.splice(clampedIndex, 0, taskId);
    next[targetColumnId] = targetIds;
    setLocalOrder(next);
    return next;
  }

  function findColumnIdForTask(taskId: string): string | undefined {
    return Object.entries(reconciledOrder).find(([, ids]) => ids.includes(taskId))?.[0];
  }

  function resetToServerOrder(): void {
    setLocalOrder({});
  }

  const orderedTasksByColumnId: Record<string, Task[]> = {};
  for (const columnId of columnIds) {
    orderedTasksByColumnId[columnId] = (reconciledOrder[columnId] ?? [])
      .map((id) => taskById.get(id))
      .filter((task): task is Task => Boolean(task));
  }

  return { orderedTasksByColumnId, moveTask, findColumnIdForTask, resetToServerOrder };
}
