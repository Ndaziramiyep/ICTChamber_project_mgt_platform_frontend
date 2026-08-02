import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cx } from "@/shared/lib/class-names";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { hasError = false, className, rows = 4, ...textAreaProps },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={hasError}
      className={cx(
        "block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-ink shadow-sm ring-1 ring-inset",
        "placeholder:text-ink-disabled focus:outline focus:outline-2 focus:-outline-offset-1",
        hasError ? "ring-error focus:outline-error" : "ring-input-border focus:outline-input-focus",
        "disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-disabled",
        className,
      )}
      {...textAreaProps}
    />
  );
});
