import { forwardRef, type ButtonHTMLAttributes } from "react";

import { Spinner } from "@/presentation/components/spinner";
import { cx } from "@/shared/lib/class-names";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-ink hover:bg-primary-hover active:bg-primary-active",
  secondary: "bg-secondary text-white hover:bg-secondary-hover",
  danger: "bg-error text-white hover:opacity-90",
  ghost: "bg-transparent text-ink-muted hover:bg-surface",
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
