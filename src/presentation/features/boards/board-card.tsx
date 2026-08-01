import { Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import type { Board } from "@/domain/entities/board";
import { Card } from "@/presentation/components/card";
import { formatDate } from "@/shared/lib/format-date";

export interface BoardCardProps {
  board: Board;
  onEdit: () => void;
  onDelete: () => void;
}

export function BoardCard({ board, onEdit, onDelete }: BoardCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/boards/${board.boardId}`}
          className="text-base font-semibold text-slate-900 hover:text-brand-600 dark:text-slate-100 dark:hover:text-brand-400"
        >
          {board.title}
        </Link>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label={`Edit ${board.title}`}
            onClick={onEdit}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${board.title}`}
            onClick={onDelete}
            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {board.description ? (
        <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {board.description}
        </p>
      ) : null}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Updated {formatDate(board.updatedAt)}
      </p>
    </Card>
  );
}
