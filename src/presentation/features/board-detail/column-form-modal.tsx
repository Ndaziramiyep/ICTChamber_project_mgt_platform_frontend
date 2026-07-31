import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  useCreateColumnMutation,
  useUpdateColumnMutation,
} from "@/application/columns/use-columns";
import type { KanbanColumn } from "@/domain/entities/column";
import { Button } from "@/presentation/components/button";
import { FormField } from "@/presentation/components/form-field";
import { Input } from "@/presentation/components/input";
import { Modal } from "@/presentation/components/modal";
import { getErrorMessage } from "@/shared/lib/get-error-message";
import { notify } from "@/shared/lib/notify";
import { columnFormSchema, type ColumnFormValues } from "@/shared/validation/board-schemas";

export interface ColumnFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  /** When provided, the modal renames this column instead of creating a new one. */
  column?: KanbanColumn;
}

export function ColumnFormModal({ open, onOpenChange, boardId, column }: ColumnFormModalProps) {
  const isEditing = Boolean(column);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Rename column" : "Add column"}
    >
      <ColumnForm boardId={boardId} column={column} onDone={() => onOpenChange(false)} />
    </Modal>
  );
}

function ColumnForm({
  boardId,
  column,
  onDone,
}: {
  boardId: string;
  column?: KanbanColumn;
  onDone: () => void;
}) {
  const createMutation = useCreateColumnMutation(boardId);
  const updateMutation = useUpdateColumnMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: { title: column?.title ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (column) {
        await updateMutation.mutateAsync({ columnId: column.columnId, draft: values });
        notify.success("Column updated.");
      } else {
        await createMutation.mutateAsync(values);
        notify.success("Column added.");
      }
      onDone();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField label="Title" errorMessage={errors.title?.message}>
        <Input {...register("title")} />
      </FormField>
      <div className="mt-2 flex justify-end gap-3">
        <Button variant="secondary" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {column ? "Save changes" : "Add column"}
        </Button>
      </div>
    </form>
  );
}
