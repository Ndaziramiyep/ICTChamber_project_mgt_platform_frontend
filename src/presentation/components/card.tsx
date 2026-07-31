import type { HTMLAttributes } from "react";

import { cx } from "@/shared/lib/class-names";

export function Card({ className, ...divProps }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("rounded-lg border border-slate-200 bg-white p-4 shadow-sm", className)}
      {...divProps}
    />
  );
}
