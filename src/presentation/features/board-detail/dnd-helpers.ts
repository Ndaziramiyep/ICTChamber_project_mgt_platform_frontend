export interface DropTarget {
  columnId: string;
  index: number;
}

export interface DraggableData {
  type?: "task" | "column-container";
  columnId?: string;
}

export interface DroppableLike {
  id: string | number;
  data: { current?: DraggableData };
}

/**
 * Given dnd-kit's `over` (the drop target under the pointer) and each column's current task-id
 * order, resolves which column a dragged task should land in and at what index. Handles both
 * dropping onto another task card (insert at that card's position) and dropping into a column's
 * empty space (append to the end) — see `column-container` droppables registered per column.
 */
export function resolveTaskDropTarget(
  over: DroppableLike | null,
  columnTaskIds: Record<string, string[]>,
): DropTarget | null {
  if (!over) {
    return null;
  }

  const overData = over.data.current;
  if (!overData?.columnId) {
    return null;
  }

  if (overData.type === "column-container") {
    return { columnId: overData.columnId, index: (columnTaskIds[overData.columnId] ?? []).length };
  }

  if (overData.type === "task") {
    const ids = columnTaskIds[overData.columnId] ?? [];
    const index = ids.indexOf(String(over.id));
    return { columnId: overData.columnId, index: index === -1 ? ids.length : index };
  }

  return null;
}
