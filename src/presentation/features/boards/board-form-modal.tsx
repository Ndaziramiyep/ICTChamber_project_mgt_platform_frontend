import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useCreateBoardMutation, useUpdateBoardMutation } from "@/application/boards/use-boards";
import type { Board } from "@/domain/entities/board";
import { Button } from "@/presentation/components/button";
import { FormField } from "@/presentation/components/form-field";
import { Input } from "@/presentation/components/input";
import { Modal } from "@/presentation/components/modal";
import { TextArea } from "@/presentation/components/text-area";
import { applyServerValidationErrors } from "@/shared/lib/apply-server-validation-errors";
import { getErrorMessage } from "@/shared/lib/get-error-message";
import { notify } from "@/shared/lib/notify";
import { boardFormSchema, type BoardFormValues } from "@/shared/validation/board-schemas";

export interface BoardFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the modal edits this board instead of creating a new one. */
  board?: Board;
}

export function BoardFormModal({ open, onOpenChange, board }: BoardFormModalProps) {
  const isEditing = Boolean(board);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Rename board" : "Create board"}
      description={isEditing ? undefined : "Give your new Kanban board a name."}
    >
      <BoardForm board={board} onDone={() => onOpenChange(false)} />
    </Modal>
  );
}

function BoardForm({ board, onDone }: { board?: Board; onDone: () => void }) {
  const createMutation = useCreateBoardMutation();
  const updateMutation = useUpdateBoardMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<BoardFormValues>({
    resolver: zodResolver(boardFormSchema),
    defaultValues: { title: board?.title ?? "", description: board?.description ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (board) {
        await updateMutation.mutateAsync({
          boardId: board.boardId,
          draft: { title: values.title, description: values.description || null },
        });
        notify.success("Board updated.");
      } else {
        await createMutation.mutateAsync({
          title: values.title,
          description: values.description || null,
        });
        notify.success("Board created.");
      }
      onDone();
    } catch (error) {
      const handledInline = applyServerValidationErrors(error, setError, {
        board_title: "title",
        board_description: "description",
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
          {board ? "Save changes" : "Create board"}
        </Button>
      </div>
    </form>
  );
}
