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
        "block w-full rounded-md border-0 px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset",
        "placeholder:text-slate-400 focus:outline focus:outline-2 focus:-outline-offset-1",
        hasError ? "ring-red-400 focus:outline-red-500" : "ring-slate-300 focus:outline-brand-600",
        "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
        "dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600 dark:placeholder:text-slate-500 dark:disabled:bg-slate-900",
        className,
      )}
      {...textAreaProps}
    />
  );
});
