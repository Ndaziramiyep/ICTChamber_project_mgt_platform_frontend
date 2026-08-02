import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
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
  tasks,
  isTasksPending,
  isTasksError,
  tasksError,
  onRetryTasks,
  searchQuery,
}: KanbanColumnProps) {
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
        "group flex w-72 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm",
        isColumnDragging && "opacity-40",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border bg-white px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            aria-label={`Drag ${column.title}`}
            className="shrink-0 touch-none rounded p-1 text-ink-disabled opacity-0 hover:bg-surface hover:text-ink-muted focus-visible:opacity-100 group-hover:opacity-100"
            {...columnDragAttributes}
            {...columnDragListeners}
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={isCollapsed ? `Expand ${column.title}` : `Collapse ${column.title}`}
            onClick={() => setIsCollapsed((previous) => !previous)}
            className="shrink-0 rounded p-1 text-ink-muted hover:bg-surface"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <h3 className="truncate text-sm font-semibold text-ink">{column.title}</h3>
          <span className="shrink-0 text-xs font-medium text-ink-muted">{tasks.length}</span>
        </div>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            aria-label={`Rename ${column.title}`}
            onClick={() => setIsRenameOpen(true)}
            className="rounded p-1 text-ink-disabled hover:bg-surface hover:text-ink-muted"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${column.title}`}
            onClick={() => setIsDeleteColumnOpen(true)}
            className="rounded p-1 text-ink-disabled hover:bg-error/10 hover:text-error"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {!isCollapsed ? (
        <div ref={setDropZoneRef} className="flex flex-1 flex-col gap-2 p-3">
          <label className="flex items-center gap-1.5 text-xs text-ink-muted">
            Sort
            <select
              aria-label={`Sort ${column.title}`}
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as TaskSortMode)}
              className="rounded border border-input-border bg-white px-1.5 py-1 text-xs text-ink"
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
            <p className="py-4 text-center text-xs text-ink-disabled">
              {isSearching ? "No tasks match your search." : "No tasks yet."}
            </p>
          ) : null}

          {!isTasksPending && !isTasksError ? (
            <SortableContext
              items={displayTasks.map((task) => task.taskId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {displayTasks.map((task) => (
                    <motion.div
                      key={task.taskId}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                    >
                      <TaskCard
                        task={task}
                        columnId={column.columnId}
                        isDragDisabled={isDragDisabled}
                        onEdit={() => setTaskBeingEdited(task)}
                        onDuplicate={() => void handleDuplicateTask(task)}
                        onDelete={() => setTaskBeingDeleted(task)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
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
