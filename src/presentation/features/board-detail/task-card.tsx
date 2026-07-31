import { Pencil, Trash2 } from "lucide-react";

import type { Task } from "@/domain/entities/task";
import { Card } from "@/presentation/components/card";

export interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card className="flex flex-col gap-2 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-900">{task.title}</p>
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
