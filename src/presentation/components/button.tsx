import { forwardRef, type ButtonHTMLAttributes } from "react";

import { Spinner } from "@/presentation/components/spinner";
import { cx } from "@/shared/lib/class-names";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600",
  secondary:
    "bg-white text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 " +
    "dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600 dark:hover:bg-slate-700",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", isLoading = false, disabled, className, children, ...buttonProps },
  ref,
) {
  return (
    <button
      ref={ref}
      type={buttonProps.type ?? "button"}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold",
        "transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_CLASSES[variant],
        className,
      )}
      disabled={disabled ?? isLoading}
      aria-busy={isLoading}
      {...buttonProps}
    >
      {isLoading ? (
        <span aria-hidden="true">
          <Spinner size="sm" />
        </span>
      ) : null}
      {children}
    </button>
  );
});
