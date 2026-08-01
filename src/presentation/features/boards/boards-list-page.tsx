import { Plus } from "lucide-react";
import { useState } from "react";

import { useBoardsQuery, useDeleteBoardMutation } from "@/application/boards/use-boards";
import type { Board } from "@/domain/entities/board";
import { Button } from "@/presentation/components/button";
import { ConfirmDialog } from "@/presentation/components/confirm-dialog";
import { EmptyState } from "@/presentation/components/empty-state";
import { ErrorState } from "@/presentation/components/page-status";
import { BoardCardsSkeleton } from "@/presentation/components/skeleton";
import { BoardCard } from "@/presentation/features/boards/board-card";
import { BoardFormModal } from "@/presentation/features/boards/board-form-modal";
import { getErrorMessage } from "@/shared/lib/get-error-message";
import { notify } from "@/shared/lib/notify";

export function BoardsListPage() {
  const boardsQuery = useBoardsQuery();
  const deleteBoardMutation = useDeleteBoardMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [boardBeingEdited, setBoardBeingEdited] = useState<Board | null>(null);
  const [boardBeingDeleted, setBoardBeingDeleted] = useState<Board | null>(null);

  const handleConfirmDelete = async () => {
    if (!boardBeingDeleted) return;
    try {
      await deleteBoardMutation.mutateAsync(boardBeingDeleted.boardId);
      notify.success(`"${boardBeingDeleted.title}" was deleted.`);
      setBoardBeingDeleted(null);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your boards</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New board
        </Button>
      </div>

      {boardsQuery.isPending ? <BoardCardsSkeleton /> : null}

      {boardsQuery.isError ? (
        <ErrorState
          message={getErrorMessage(boardsQuery.error)}
          onRetry={() => boardsQuery.refetch()}
        />
      ) : null}

      {boardsQuery.isSuccess && boardsQuery.data.length === 0 ? (
        <EmptyState
          title="No boards yet"
          description="Create your first board to start organizing tasks."
          action={<Button onClick={() => setIsCreateModalOpen(true)}>Create a board</Button>}
        />
      ) : null}

      {boardsQuery.isSuccess && boardsQuery.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boardsQuery.data.map((board) => (
            <BoardCard
              key={board.boardId}
              board={board}
              onEdit={() => setBoardBeingEdited(board)}
              onDelete={() => setBoardBeingDeleted(board)}
            />
          ))}
        </div>
      ) : null}

      <BoardFormModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />

      {boardBeingEdited ? (
        <BoardFormModal
          open={Boolean(boardBeingEdited)}
          onOpenChange={(open) => !open && setBoardBeingEdited(null)}
          board={boardBeingEdited}
        />
      ) : null}

      {boardBeingDeleted ? (
        <ConfirmDialog
          open={Boolean(boardBeingDeleted)}
          onOpenChange={(open) => !open && setBoardBeingDeleted(null)}
          title={`Delete "${boardBeingDeleted.title}"?`}
          description="This deletes the board and all of its columns and tasks. This cannot be undone."
          isConfirming={deleteBoardMutation.isPending}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </div>
  );
}
