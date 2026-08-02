import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/** Accessible modal dialog built on Radix — handles focus trapping, escape-to-close, and labelling. */
export function Modal({ open, onOpenChange, title, description, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-secondary/40 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className={
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 " +
            "rounded-lg bg-white p-6 shadow-xl focus:outline-none"
          }
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-ink">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-ink-muted">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close
              aria-label="Close dialog"
              className="rounded-md p-1 text-ink-disabled hover:bg-surface hover:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
