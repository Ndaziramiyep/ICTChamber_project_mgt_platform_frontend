import { cx } from "@/shared/lib/class-names";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded bg-border", className)} aria-hidden="true" />;
}

/** Placeholder shown while a board's columns are loading. */
export function ColumnsSkeleton() {
  return (
    <div className="flex items-start gap-4" role="status" aria-label="Loading columns">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex w-72 shrink-0 flex-col gap-3 rounded-xl bg-surface p-3">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

/** Placeholder shown while a column's tasks are loading. */
export function TaskListSkeleton() {
  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Loading tasks">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

/** Placeholder shown while the boards list is loading. */
export function BoardCardsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading boards"
    >
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
