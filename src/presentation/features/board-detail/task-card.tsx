import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Pencil, Trash2 } from "lucide-react";

import type { Task } from "@/domain/entities/task";
import { Card } from "@/presentation/components/card";
import { cx } from "@/shared/lib/class-names";

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cx("flex flex-col gap-2 p-3", isDragging && "opacity-40")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-1.5">
          <button
            type="button"
            aria-label={`Drag ${task.title}`}
            disabled={isDragDisabled}
            className={cx(
              "mt-0.5 shrink-0 touch-none rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500",
              isDragDisabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
            )}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <p className="text-sm font-medium wrap-break-word text-slate-900">{task.title}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label={`Edit ${task.title}`}
            onClick={onEdit}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Duplicate ${task.title}`}
            onClick={onDuplicate}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${task.title}`}
            onClick={onDelete}
            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      {task.description ? (
        <p className="line-clamp-3 text-xs text-slate-500">{task.description}</p>
      ) : null}
    </Card>
  );
}

/** Static preview rendered inside the `DragOverlay` while a card is being dragged. */
export function TaskCardPreview({ task }: { task: Task }) {
  return (
    <Card className="flex flex-col gap-2 p-3 shadow-lg">
      <p className="text-sm font-medium wrap-break-word text-slate-900">{task.title}</p>
      {task.description ? (
        <p className="line-clamp-3 text-xs text-slate-500">{task.description}</p>
      ) : null}
    </Card>
  );
}
