import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useCreateTaskMutation, useUpdateTaskMutation } from "@/application/tasks/use-tasks";
import type { Task } from "@/domain/entities/task";
import { Button } from "@/presentation/components/button";
import { FormField } from "@/presentation/components/form-field";
import { Input } from "@/presentation/components/input";
import { Modal } from "@/presentation/components/modal";
import { TextArea } from "@/presentation/components/text-area";
import { applyServerValidationErrors } from "@/shared/lib/apply-server-validation-errors";
import { getErrorMessage } from "@/shared/lib/get-error-message";
import { notify } from "@/shared/lib/notify";
import { taskFormSchema, type TaskFormValues } from "@/shared/validation/board-schemas";

export interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnId: string;
  /** When provided, the modal edits this task instead of creating a new one. */
  task?: Task;
}

export function TaskFormModal({ open, onOpenChange, columnId, task }: TaskFormModalProps) {
  const isEditing = Boolean(task);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={isEditing ? "Edit task" : "Add task"}>
      <TaskForm columnId={columnId} task={task} onDone={() => onOpenChange(false)} />
    </Modal>
  );
}

function TaskForm({
  columnId,
  task,
  onDone,
}: {
  columnId: string;
  task?: Task;
  onDone: () => void;
}) {
  const createMutation = useCreateTaskMutation(columnId);
  const updateMutation = useUpdateTaskMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: task?.title ?? "", description: task?.description ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (task) {
        await updateMutation.mutateAsync({
          taskId: task.taskId,
          draft: { title: values.title, description: values.description || null },
        });
        notify.success("Task updated.");
      } else {
        await createMutation.mutateAsync({
          title: values.title,
          description: values.description || null,
        });
        notify.success("Task added.");
      }
      onDone();
    } catch (error) {
      const handledInline = applyServerValidationErrors(error, setError, {
        task_title: "title",
        task_description: "description",
      });
      if (!handledInline) {
        notify.error(getErrorMessage(error));
      }
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField label="Title" errorMessage={errors.title?.message}>
        <Input {...register("title")} />
      </FormField>
      <FormField label="Description" errorMessage={errors.description?.message}>
        <TextArea {...register("description")} />
      </FormField>
      <div className="mt-2 flex justify-end gap-3">
        <Button variant="secondary" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {task ? "Save changes" : "Add task"}
        </Button>
      </div>
    </form>
  );
}
