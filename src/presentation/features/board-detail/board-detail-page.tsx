import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type Over,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  SortableContext,
} from "@dnd-kit/sortable";
import { ArrowLeft, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { useBoardQuery } from "@/application/boards/use-boards";
import { useColumnsQuery } from "@/application/columns/use-columns";
import { useTasksByColumnsQuery } from "@/application/tasks/use-tasks";
import type { KanbanColumn as KanbanColumnEntity } from "@/domain/entities/column";
import type { Task } from "@/domain/entities/task";
import { Button } from "@/presentation/components/button";
import { EmptyState } from "@/presentation/components/empty-state";
import { ErrorState } from "@/presentation/components/page-status";
import { ColumnsSkeleton } from "@/presentation/components/skeleton";
import { ColumnFormModal } from "@/presentation/features/board-detail/column-form-modal";
import {
  boardCollisionDetection,
  resolveTaskDropTarget,
} from "@/presentation/features/board-detail/dnd-helpers";
import { KanbanColumn } from "@/presentation/features/board-detail/kanban-column";
import { TaskCardPreview } from "@/presentation/features/board-detail/task-card";
import { useBoardTaskOrder } from "@/presentation/features/board-detail/use-board-task-order";
import { useReorderableColumns } from "@/presentation/features/board-detail/use-reorderable-columns";
import { getErrorMessage } from "@/shared/lib/get-error-message";

type ActiveDrag = { type: "column"; column: KanbanColumnEntity } | { type: "task"; task: Task };

export function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasUnsavedOrderChanges, setHasUnsavedOrderChanges] = useState(false);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const boardQuery = useBoardQuery(boardId ?? "");
  const columnsQuery = useColumnsQuery(boardId ?? "");
  const columns = useMemo(() => columnsQuery.data ?? [], [columnsQuery.data]);
  const { orderedColumns, reorderColumns } = useReorderableColumns(columns);

  const columnIds = useMemo(() => columns.map((column) => column.columnId), [columns]);
  const tasksQuery = useTasksByColumnsQuery(columnIds);
  const { orderedTasksByColumnId, moveTask, findColumnIdForTask } = useBoardTaskOrder(
    columnIds,
    tasksQuery.tasksByColumnId,
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "/") return;
      const activeElement = document.activeElement;
      const isTypingElsewhere =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute("contenteditable") === "true";
      if (isTypingElsewhere) return;
      event.preventDefault();
      searchInputRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function buildColumnTaskIdMap(): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    for (const columnId of columnIds) {
      map[columnId] = (orderedTasksByColumnId[columnId] ?? []).map((task) => task.taskId);
    }
    return map;
  }

  function handleDragStart(event: DragStartEvent) {
    const dragType = (event.active.data.current as { type?: string } | undefined)?.type;
    if (dragType === "column") {
      const column = orderedColumns.find((candidate) => candidate.columnId === event.active.id);
      if (column) setActiveDrag({ type: "column", column });
      return;
    }
    if (dragType === "task") {
      const columnId = findColumnIdForTask(String(event.active.id));
      const task = columnId
        ? orderedTasksByColumnId[columnId]?.find(
            (candidate) => candidate.taskId === event.active.id,
          )
        : undefined;
      if (task) setActiveDrag({ type: "task", task });
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const dragType = (event.active.data.current as { type?: string } | undefined)?.type;
    if (dragType !== "task" || !event.over) return;

    const taskId = String(event.active.id);
    const dropTarget = resolveTaskDropTarget(event.over as Over, buildColumnTaskIdMap());
    if (!dropTarget) return;

    const currentColumnId = findColumnIdForTask(taskId);
    if (currentColumnId === dropTarget.columnId) return;
    moveTask(taskId, dropTarget.columnId, dropTarget.index);
    setHasUnsavedOrderChanges(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    const dragType = (event.active.data.current as { type?: string } | undefined)?.type;
    setActiveDrag(null);
    if (!event.over) return;

    if (dragType === "column") {
      if (event.active.id !== event.over.id) {
        reorderColumns(String(event.active.id), String(event.over.id));
        setHasUnsavedOrderChanges(true);
      }
      return;
    }

    if (dragType === "task") {
      const taskId = String(event.active.id);
      const dropTarget = resolveTaskDropTarget(event.over as Over, buildColumnTaskIdMap());
      if (dropTarget) {
        moveTask(taskId, dropTarget.columnId, dropTarget.index);
        setHasUnsavedOrderChanges(true);
      }
    }
  }

  if (!boardId) {
    return <Navigate to="/boards" replace />;
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-divider bg-white px-6 py-4">
        <Link
          to="/boards"
          className="inline-flex items-center gap-1 text-sm font-medium text-info hover:opacity-80"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All boards
        </Link>

        {boardQuery.isPending ? (
          <p className="mt-2 text-sm text-ink-disabled">Loading board…</p>
        ) : null}
        {boardQuery.isError ? (
          <p className="mt-2 text-sm text-error">{getErrorMessage(boardQuery.error)}</p>
        ) : null}
        {boardQuery.isSuccess ? (
          <>
            <h1 className="mt-1 text-xl font-bold text-ink">{boardQuery.data.title}</h1>
            {boardQuery.data.description ? (
              <p className="mt-1 text-sm text-ink-muted">{boardQuery.data.description}</p>
            ) : null}
          </>
        ) : null}

        <div className="relative mt-3 max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-ink-disabled"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search tasks… (press / to focus)"
            aria-label="Search tasks"
            className="w-full rounded-md border border-input-border py-1.5 pr-8 pl-8 text-sm placeholder:text-ink-disabled focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-focus"
          />
          {searchQuery ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-ink-disabled hover:bg-surface hover:text-ink-muted"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </header>

      {hasUnsavedOrderChanges ? (
        <div className="border-b border-warning/30 bg-warning/10 px-6 py-2 text-xs text-ink">
          Card and column order isn&apos;t saved yet — the backend doesn&apos;t support persisting
          order, so refreshing this page resets it to the original order.
        </div>
      ) : null}

      <main className="flex-1 overflow-x-auto bg-surface px-6 py-6">
        {columnsQuery.isPending ? <ColumnsSkeleton /> : null}
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
          <DndContext
            sensors={sensors}
            collisionDetection={boardCollisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedColumns.map((column) => column.columnId)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex items-start gap-4">
                {orderedColumns.map((column) => {
                  const columnTasksState = tasksQuery.stateByColumnId[column.columnId];
                  return (
                    <KanbanColumn
                      key={column.columnId}
                      column={column}
                      boardId={boardId}
                      tasks={orderedTasksByColumnId[column.columnId] ?? []}
                      isTasksPending={columnTasksState?.isPending ?? true}
                      isTasksError={columnTasksState?.isError ?? false}
                      tasksError={columnTasksState?.error}
                      onRetryTasks={() => columnTasksState?.refetch()}
                      searchQuery={searchQuery}
                    />
                  );
                })}
                <Button
                  variant="secondary"
                  className="shrink-0"
                  onClick={() => setIsAddColumnOpen(true)}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add column
                </Button>
              </div>
            </SortableContext>

            <DragOverlay>
              {activeDrag?.type === "task" ? <TaskCardPreview task={activeDrag.task} /> : null}
              {activeDrag?.type === "column" ? (
                <div className="w-72 rounded-xl border border-border bg-white px-3 py-2.5 shadow-lg">
                  <span className="text-sm font-semibold text-ink">{activeDrag.column.title}</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : null}
      </main>

      <ColumnFormModal open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen} boardId={boardId} />
    </div>
  );
}
