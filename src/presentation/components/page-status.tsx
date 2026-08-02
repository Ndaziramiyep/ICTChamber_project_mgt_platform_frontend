import { Button } from "@/presentation/components/button";
import { Spinner } from "@/presentation/components/spinner";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-ink-disabled">
      <Spinner size="lg" label={label} />
    </div>
  );
}

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-error/30 bg-error/10 p-6 text-center">
      <p className="text-sm text-error">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
