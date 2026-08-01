import { arrayMove } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";

import type { KanbanColumn } from "@/domain/entities/column";

export interface UseReorderableColumnsResult {
  /** Columns in their current display order — server order, adjusted by any local drag. */
  orderedColumns: KanbanColumn[];
  /** Reorders by dragging `activeId` to sit where `overId` currently is. Client-side only. */
  reorderColumns: (activeId: string, overId: string) => void;
}

/**
 * Tracks a local display order for a board's columns, seeded from and reconciled against the
 * server order (`GET /boards/{id}/columns`, which the backend only returns in creation order —
 * see `Project_Backend_descriptions.md`). Dragging reorders this local list only; nothing is
 * persisted, since the backend has no endpoint to save column order yet.
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

  function reorderColumns(activeId: string, overId: string): void {
    if (activeId === overId) return;
    setLocalOrder((prev) => {
      const base = reconciledIds;
      const activeIndex = base.indexOf(activeId);
      const overIndex = base.indexOf(overId);
      if (activeIndex === -1 || overIndex === -1) return prev;
      return arrayMove(base, activeIndex, overIndex);
    });
  }

  const orderedColumns = reconciledIds
    .map((id) => columnById.get(id))
    .filter((c): c is KanbanColumn => Boolean(c));

  return { orderedColumns, reorderColumns };
}
