import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
      {description ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
