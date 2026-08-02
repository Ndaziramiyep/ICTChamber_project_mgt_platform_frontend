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
          className="text-base font-semibold text-ink hover:text-info"
        >
          {board.title}
        </Link>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label={`Edit ${board.title}`}
            onClick={onEdit}
            className="rounded p-1 text-ink-disabled hover:bg-surface hover:text-ink-muted"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${board.title}`}
            onClick={onDelete}
            className="rounded p-1 text-ink-disabled hover:bg-error/10 hover:text-error"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {board.description ? (
        <p className="line-clamp-2 text-sm text-ink-muted">{board.description}</p>
      ) : null}
      <p className="text-xs text-ink-disabled">Updated {formatDate(board.updatedAt)}</p>
    </Card>
  );
}
