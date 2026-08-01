import { forwardRef, type HTMLAttributes } from "react";

import { cx } from "@/shared/lib/class-names";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card(
  { className, ...divProps },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900",
        className,
      )}
      {...divProps}
    />
  );
});
