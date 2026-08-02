import { closestCenter, type CollisionDetection } from "@dnd-kit/core";

export interface DropTarget {
  columnId: string;
  index: number;
}

export type DraggableType = "task" | "column-container" | "column";

export interface DraggableData {
  type?: DraggableType;
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

/**
 * Keeps a dragged item's valid drop targets restricted to its own kind: a dragged column can
 * only collide with other columns, and a dragged task can only collide with other tasks or a
 * column's task-container. Without this, a task dragged into a column's empty space can resolve
 * `over` to that column's own (column-reorder) sortable instead of its task-container — since
 * the column's outer rect fully encloses the container's, `closestCenter` can pick either one —
 * which silently no-ops the move. This is what made cross-column dragging feel unreliable with
 * a mouse: it only worked when dropping exactly on another card.
 */
export function filterDroppablesByActiveType<T extends { data: { current?: DraggableData } }>(
  activeType: DraggableType | undefined,
  containers: T[],
): T[] {
  return containers.filter((container) => {
    const containerType = container.data.current?.type;
    if (activeType === "column") {
      return containerType === "column";
    }
    if (activeType === "task") {
      return containerType === "task" || containerType === "column-container";
    }
    return true;
  });
}

export const boardCollisionDetection: CollisionDetection = (args) => {
  const activeType = (args.active.data.current as DraggableData | undefined)?.type;
  const filteredContainers = filterDroppablesByActiveType(activeType, args.droppableContainers);
  return closestCenter({ ...args, droppableContainers: filteredContainers });
};
