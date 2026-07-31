import { cx } from "@/shared/lib/class-names";

const SIZE_CLASSES = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
} as const;

export interface SpinnerProps {
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  label?: string;
}

export function Spinner({ size = "md", className, label = "Loading…" }: SpinnerProps) {
  return (
    <span role="status" className={cx("inline-flex items-center", className)}>
      <span
        aria-hidden="true"
        className={cx(
          "animate-spin rounded-full border-current border-t-transparent text-current opacity-70",
          SIZE_CLASSES[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
