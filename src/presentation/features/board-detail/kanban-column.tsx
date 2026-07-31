import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { useDeleteColumnMutation } from "@/application/columns/use-columns";
import { useDeleteTaskMutation, useTasksQuery } from "@/application/tasks/use-tasks";
import type { KanbanColumn as KanbanColumnEntity } from "@/domain/entities/column";
import type { Task } from "@/domain/entities/task";
import { Button } from "@/presentation/components/button";
import { ConfirmDialog } from "@/presentation/components/confirm-dialog";
import { ErrorState, LoadingState } from "@/presentation/components/page-status";
import { ColumnFormModal } from "@/presentation/features/board-detail/column-form-modal";
import { TaskCard } from "@/presentation/features/board-detail/task-card";
import { TaskFormModal } from "@/presentation/features/board-detail/task-form-modal";
import { getErrorMessage } from "@/shared/lib/get-error-message";
import { notify } from "@/shared/lib/notify";

export interface KanbanColumnProps {
  column: KanbanColumnEntity;
  boardId: string;
}

export function KanbanColumn({ column, boardId }: KanbanColumnProps) {
  const tasksQuery = useTasksQuery(column.columnId);
  const deleteColumnMutation = useDeleteColumnMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteColumnOpen, setIsDeleteColumnOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskBeingEdited, setTaskBeingEdited] = useState<Task | null>(null);
  const [taskBeingDeleted, setTaskBeingDeleted] = useState<Task | null>(null);

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

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-slate-100 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{column.title}</h3>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label={`Rename ${column.title}`}
            onClick={() => setIsRenameOpen(true)}
            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${column.title}`}
            onClick={() => setIsDeleteColumnOpen(true)}
            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {tasksQuery.isPending ? <LoadingState label={`Loading ${column.title} tasks…`} /> : null}
      {tasksQuery.isError ? (
        <ErrorState
          message={getErrorMessage(tasksQuery.error)}
          onRetry={() => tasksQuery.refetch()}
        />
      ) : null}

      {tasksQuery.isSuccess ? (
        <div className="flex flex-col gap-2">
          {tasksQuery.data.map((task) => (
            <TaskCard
              key={task.taskId}
              task={task}
              onEdit={() => setTaskBeingEdited(task)}
              onDelete={() => setTaskBeingDeleted(task)}
            />
          ))}
        </div>
      ) : null}

      <Button variant="ghost" className="mt-3" onClick={() => setIsAddTaskOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add task
      </Button>

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
