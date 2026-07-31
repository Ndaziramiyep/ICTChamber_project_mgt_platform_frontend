import { Button } from "@/presentation/components/button";
import { Modal } from "@/presentation/components/modal";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
}

/** Confirmation prompt for destructive actions (deleting a board, column, or task). */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  isConfirming = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="mt-2 flex justify-end gap-3">
        <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isConfirming}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isConfirming}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
