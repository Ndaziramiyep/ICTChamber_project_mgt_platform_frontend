import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { useBoardQuery } from "@/application/boards/use-boards";
import { useColumnsQuery } from "@/application/columns/use-columns";
import { Button } from "@/presentation/components/button";
import { EmptyState } from "@/presentation/components/empty-state";
import { ErrorState, LoadingState } from "@/presentation/components/page-status";
import { ColumnFormModal } from "@/presentation/features/board-detail/column-form-modal";
import { KanbanColumn } from "@/presentation/features/board-detail/kanban-column";
import { getErrorMessage } from "@/shared/lib/get-error-message";

export function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);

  const boardQuery = useBoardQuery(boardId ?? "");
  const columnsQuery = useColumnsQuery(boardId ?? "");

  if (!boardId) {
    return <Navigate to="/boards" replace />;
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link
          to="/boards"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All boards
        </Link>

        {boardQuery.isPending ? (
          <p className="mt-2 text-sm text-slate-400">Loading board…</p>
        ) : null}
        {boardQuery.isError ? (
          <p className="mt-2 text-sm text-red-600">{getErrorMessage(boardQuery.error)}</p>
        ) : null}
        {boardQuery.isSuccess ? (
          <>
            <h1 className="mt-1 text-xl font-bold text-slate-900">{boardQuery.data.title}</h1>
            {boardQuery.data.description ? (
              <p className="mt-1 text-sm text-slate-500">{boardQuery.data.description}</p>
            ) : null}
          </>
        ) : null}
      </header>

      <main className="flex-1 overflow-x-auto px-6 py-6">
        {columnsQuery.isPending ? <LoadingState label="Loading columns…" /> : null}
        {columnsQuery.isError ? (
          <ErrorState
            message={getErrorMessage(columnsQuery.error)}
            onRetry={() => columnsQuery.refetch()}
          />
        ) : null}

        {columnsQuery.isSuccess && columnsQuery.data.length === 0 ? (
          <EmptyState
            title="No columns yet"
            description="Add a column to start tracking tasks on this board."
            action={<Button onClick={() => setIsAddColumnOpen(true)}>Add a column</Button>}
          />
        ) : null}

        {columnsQuery.isSuccess && columnsQuery.data.length > 0 ? (
          <div className="flex items-start gap-4">
            {columnsQuery.data.map((column, index) => (
              <KanbanColumn
                key={column.columnId}
                column={column}
                boardId={boardId}
                accentIndex={index}
              />
            ))}
            <Button
              variant="secondary"
              className="shrink-0"
              onClick={() => setIsAddColumnOpen(true)}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add column
            </Button>
          </div>
        ) : null}
      </main>

      <ColumnFormModal open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen} boardId={boardId} />
    </div>
  );
}
