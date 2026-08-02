import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Copy, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import type { Task } from "@/domain/entities/task";
import { Card } from "@/presentation/components/card";
import { cx } from "@/shared/lib/class-names";
import { readIsTaskComplete, writeIsTaskComplete } from "@/shared/lib/task-complete-storage";

export interface TaskCardProps {
  task: Task;
  /** The column this card currently displays under (may differ from `task.parentColumnId` after
   * an unsaved local drag — see `useBoardTaskOrder`). */
  columnId: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  /** True while this column is showing a non-manual sort — dragging is disabled so the sort
   * order and the drag order can't fight each other. */
  isDragDisabled?: boolean;
}

export function TaskCard({
  task,
  columnId,
  onEdit,
  onDuplicate,
  onDelete,
  isDragDisabled,
}: TaskCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.taskId,
    data: { type: "task", columnId },
    disabled: isDragDisabled,
  });

  // The backend has no "completed" field on tasks yet (see BACKEND_EXTENSIONS_NEEDED.md), so
  // this is remembered in localStorage instead — real persistence, just not server-backed.
  const [isComplete, setIsComplete] = useState(() => readIsTaskComplete(task.taskId));

  function handleToggleComplete() {
    setIsComplete((previous) => {
      const next = !previous;
      writeIsTaskComplete(task.taskId, next);
      return next;
    });
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cx(
        "group/task flex touch-none flex-col gap-2 p-3",
        isDragDisabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-1.5">
          <button
            type="button"
            data-no-dnd
            role="checkbox"
            aria-checked={isComplete}
            aria-label={
              isComplete ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`
            }
            onClick={handleToggleComplete}
            className={cx(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              isComplete
                ? "border-success bg-success text-white"
                : "border-input-border bg-white text-transparent hover:border-ink-disabled",
            )}
          >
            <Check className="h-3 w-3" aria-hidden="true" />
          </button>
          <p className="text-sm font-medium wrap-break-word text-ink">{task.title}</p>
        </div>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover/task:opacity-100">
          <button
            type="button"
            data-no-dnd
            aria-label={`Edit ${task.title}`}
            onClick={onEdit}
            className="rounded p-1 text-ink-disabled hover:bg-surface hover:text-ink-muted"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            data-no-dnd
            aria-label={`Duplicate ${task.title}`}
            onClick={onDuplicate}
            className="rounded p-1 text-ink-disabled hover:bg-surface hover:text-ink-muted"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            data-no-dnd
            aria-label={`Delete ${task.title}`}
            onClick={onDelete}
            className="rounded p-1 text-ink-disabled hover:bg-error/10 hover:text-error"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      {task.description ? (
        <p className="line-clamp-3 text-xs text-ink-muted">{task.description}</p>
      ) : null}
    </Card>
  );
}

/** Static preview rendered inside the `DragOverlay` while a card is being dragged. */
export function TaskCardPreview({ task }: { task: Task }) {
  return (
    <Card className="flex flex-col gap-2 p-3 shadow-lg">
      <p className="text-sm font-medium wrap-break-word text-ink">{task.title}</p>
      {task.description ? (
        <p className="line-clamp-3 text-xs text-ink-muted">{task.description}</p>
      ) : null}
    </Card>
  );
}
