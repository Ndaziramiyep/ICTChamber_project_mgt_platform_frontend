import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-info">404</p>
      <h1 className="text-2xl font-bold text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        to="/boards"
        className="rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-ink hover:bg-primary-hover"
      >
        Back to your boards
      </Link>
    </div>
  );
}
