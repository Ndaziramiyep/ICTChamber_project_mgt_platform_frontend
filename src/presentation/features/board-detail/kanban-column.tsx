import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { useDeleteColumnMutation } from "@/application/columns/use-columns";
import { useCreateTaskMutation, useDeleteTaskMutation } from "@/application/tasks/use-tasks";
import type { KanbanColumn as KanbanColumnEntity } from "@/domain/entities/column";
import type { Task } from "@/domain/entities/task";
import { Button } from "@/presentation/components/button";
import { ConfirmDialog } from "@/presentation/components/confirm-dialog";
import { ErrorState } from "@/presentation/components/page-status";
import { TaskListSkeleton } from "@/presentation/components/skeleton";
import { getColumnAccent } from "@/presentation/features/board-detail/column-accent";
import { ColumnFormModal } from "@/presentation/features/board-detail/column-form-modal";
import {
  TASK_SORT_OPTIONS,
  sortTasks,
  type TaskSortMode,
} from "@/presentation/features/board-detail/sort-tasks";
import { TaskCard } from "@/presentation/features/board-detail/task-card";
import { TaskFormModal } from "@/presentation/features/board-detail/task-form-modal";
import { taskMatchesSearch } from "@/presentation/features/board-detail/task-search";
import { cx } from "@/shared/lib/class-names";
import { getErrorMessage } from "@/shared/lib/get-error-message";
import { notify } from "@/shared/lib/notify";

export interface KanbanColumnProps {
  column: KanbanColumnEntity;
  boardId: string;
  /** Position among the board's columns, used to pick a distinct header color. */
  accentIndex: number;
  tasks: Task[];
  isTasksPending: boolean;
  isTasksError: boolean;
  tasksError?: unknown;
  onRetryTasks: () => void;
  searchQuery: string;
}

export function KanbanColumn({
  column,
  boardId,
  accentIndex,
  tasks,
  isTasksPending,
  isTasksError,
  tasksError,
  onRetryTasks,
  searchQuery,
}: KanbanColumnProps) {
  const accent = getColumnAccent(accentIndex);
  const deleteColumnMutation = useDeleteColumnMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const createTaskMutation = useCreateTaskMutation(column.columnId);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sortMode, setSortMode] = useState<TaskSortMode>("manual");
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteColumnOpen, setIsDeleteColumnOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskBeingEdited, setTaskBeingEdited] = useState<Task | null>(null);
  const [taskBeingDeleted, setTaskBeingDeleted] = useState<Task | null>(null);

  const {
    setNodeRef: setColumnNodeRef,
    attributes: columnDragAttributes,
    listeners: columnDragListeners,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({ id: column.columnId, data: { type: "column" } });
  const columnStyle = { transform: CSS.Transform.toString(transform), transition };

  const { setNodeRef: setDropZoneRef } = useDroppable({
    id: `column-container-${column.columnId}`,
    data: { type: "column-container", columnId: column.columnId },
  });

  const isSearching = searchQuery.trim().length > 0;
  const visibleTasks = tasks.filter((task) => taskMatchesSearch(task, searchQuery));
  const displayTasks = sortMode === "manual" ? visibleTasks : sortTasks(visibleTasks, sortMode);
  const isDragDisabled = isSearching || sortMode !== "manual";

  const handleConfirmDeleteColumn = async () => {
    try {
      await deleteColumnMutation.mutateAsync({ columnId: column.columnId, boardId });
      notify.success(`"${column.title}" was deleted.`);
      setIsDeleteColumnOpen(false);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskBeingDeleted) return;
    try {
      await deleteTaskMutation.mutateAsync({
        taskId: taskBeingDeleted.taskId,
        columnId: column.columnId,
      });
      notify.success(`"${taskBeingDeleted.title}" was deleted.`);
      setTaskBeingDeleted(null);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const handleDuplicateTask = async (task: Task) => {
    try {
      await createTaskMutation.mutateAsync({
        title: `${task.title} (copy)`,
        description: task.description,
      });
      notify.success(`"${task.title}" was duplicated.`);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  return (
    <div
      ref={setColumnNodeRef}
      style={columnStyle}
      className={cx(
        "flex w-72 shrink-0 flex-col overflow-hidden rounded-xl bg-slate-100 shadow-sm",
        isColumnDragging && "opacity-40",
      )}
    >
      <div className={cx("flex items-center justify-between gap-2 px-3 py-2.5", accent.header)}>
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            aria-label={`Drag ${column.title}`}
            className={cx(
              "shrink-0 touch-none rounded p-1 opacity-60 hover:bg-black/10",
              accent.headerText,
            )}
            {...columnDragAttributes}
            {...columnDragListeners}
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={isCollapsed ? `Expand ${column.title}` : `Collapse ${column.title}`}
            onClick={() => setIsCollapsed((previous) => !previous)}
            className={cx(
              "shrink-0 rounded p-1 opacity-70 hover:bg-black/10 hover:opacity-100",
              accent.headerText,
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <h3 className={cx("truncate text-sm font-semibold", accent.headerText)}>
            {column.title}
          </h3>
          <span className={cx("shrink-0 text-xs font-medium opacity-70", accent.headerText)}>
            {tasks.length}
          </span>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label={`Rename ${column.title}`}
            onClick={() => setIsRenameOpen(true)}
            className={cx(
              "rounded p-1 opacity-70 hover:bg-black/10 hover:opacity-100",
              accent.headerText,
            )}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${column.title}`}
            onClick={() => setIsDeleteColumnOpen(true)}
            className={cx(
              "rounded p-1 opacity-70 hover:bg-black/10 hover:opacity-100",
              accent.headerText,
            )}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {!isCollapsed ? (
        <div ref={setDropZoneRef} className="flex flex-1 flex-col gap-2 p-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-500">
            Sort
            <select
              aria-label={`Sort ${column.title}`}
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as TaskSortMode)}
              className="rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-700"
            >
              {TASK_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {isTasksPending ? <TaskListSkeleton /> : null}
          {isTasksError ? (
            <ErrorState message={getErrorMessage(tasksError)} onRetry={onRetryTasks} />
          ) : null}

          {!isTasksPending && !isTasksError && displayTasks.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-400">
              {isSearching ? "No tasks match your search." : "No tasks yet."}
            </p>
          ) : null}

          {!isTasksPending && !isTasksError ? (
            <SortableContext
              items={displayTasks.map((task) => task.taskId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {displayTasks.map((task) => (
                  <TaskCard
                    key={task.taskId}
                    task={task}
                    columnId={column.columnId}
                    isDragDisabled={isDragDisabled}
                    onEdit={() => setTaskBeingEdited(task)}
                    onDuplicate={() => void handleDuplicateTask(task)}
                    onDelete={() => setTaskBeingDeleted(task)}
                  />
                ))}
              </div>
            </SortableContext>
          ) : null}

          <Button variant="ghost" className="mt-1" onClick={() => setIsAddTaskOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add task
          </Button>
        </div>
      ) : null}

      <ColumnFormModal
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        boardId={boardId}
        column={column}
      />

      <ConfirmDialog
        open={isDeleteColumnOpen}
        onOpenChange={setIsDeleteColumnOpen}
        title={`Delete "${column.title}"?`}
        description="This deletes the column and all of its tasks. This cannot be undone."
        isConfirming={deleteColumnMutation.isPending}
        onConfirm={handleConfirmDeleteColumn}
      />

      <TaskFormModal
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        columnId={column.columnId}
      />

      {taskBeingEdited ? (
        <TaskFormModal
          open={Boolean(taskBeingEdited)}
          onOpenChange={(open) => !open && setTaskBeingEdited(null)}
          columnId={column.columnId}
          task={taskBeingEdited}
        />
      ) : null}

      {taskBeingDeleted ? (
        <ConfirmDialog
          open={Boolean(taskBeingDeleted)}
          onOpenChange={(open) => !open && setTaskBeingDeleted(null)}
          title={`Delete "${taskBeingDeleted.title}"?`}
          isConfirming={deleteTaskMutation.isPending}
          onConfirm={handleConfirmDeleteTask}
        />
      ) : null}
    </div>
  );
}
