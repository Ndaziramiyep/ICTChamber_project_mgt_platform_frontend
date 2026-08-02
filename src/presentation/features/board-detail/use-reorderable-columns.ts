import { arrayMove } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";

import type { KanbanColumn } from "@/domain/entities/column";

export interface UseReorderableColumnsResult {
  /** Columns in their current display order — server order, adjusted by any local drag. */
  orderedColumns: KanbanColumn[];
  /**
   * Reorders by dragging `activeId` to sit where `overId` currently is, and returns the
   * resulting full column-id order (or `null` if the drag was a no-op) so the caller can
   * persist it in the same tick, without waiting on the state update to flush.
   */
  reorderColumns: (activeId: string, overId: string) => string[] | null;
  /** Discards any local (unpersisted) reorder and snaps back to the server-reported order. */
  resetToServerOrder: () => void;
}

/**
 * Tracks a local display order for a board's columns, seeded from and reconciled against the
 * server order (`GET /boards/{id}/columns`). Dragging reorders this local list immediately for
 * instant visual feedback; the caller is responsible for persisting it (see
 * `PUT /boards/{id}/columns/reorder` in `Project_Backend_descriptions.md`) and for calling
 * `resetToServerOrder` if that persistence fails.
 */
export function useReorderableColumns(columns: KanbanColumn[]): UseReorderableColumnsResult {
  const [localOrder, setLocalOrder] = useState<string[]>(() => columns.map((c) => c.columnId));

  const columnById = useMemo(() => new Map(columns.map((c) => [c.columnId, c])), [columns]);

  // Merge server columns into local order: keep local positions, append new, drop deleted
  const reconciledIds = useMemo(() => {
    const serverIds = new Set(columns.map((c) => c.columnId));
    const kept = localOrder.filter((id) => serverIds.has(id));
    const added = columns.map((c) => c.columnId).filter((id) => !localOrder.includes(id));
    return [...kept, ...added];
  }, [columns, localOrder]);

  function reorderColumns(activeId: string, overId: string): string[] | null {
    if (activeId === overId) return null;
    const activeIndex = reconciledIds.indexOf(activeId);
    const overIndex = reconciledIds.indexOf(overId);
    if (activeIndex === -1 || overIndex === -1) return null;
    const next = arrayMove(reconciledIds, activeIndex, overIndex);
    setLocalOrder(next);
    return next;
  }

  function resetToServerOrder(): void {
    setLocalOrder(columns.map((c) => c.columnId));
  }

  const orderedColumns = reconciledIds
    .map((id) => columnById.get(id))
    .filter((c): c is KanbanColumn => Boolean(c));

  return { orderedColumns, reorderColumns, resetToServerOrder };
}
