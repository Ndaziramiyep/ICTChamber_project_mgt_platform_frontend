import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        to="/boards"
        className="rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Back to your boards
      </Link>
    </div>
  );
}
