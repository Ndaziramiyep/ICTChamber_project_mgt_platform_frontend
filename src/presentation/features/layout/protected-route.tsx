import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/application/auth/auth-store";
import { useSessionBootstrap } from "@/application/auth/use-session-bootstrap";
import { Spinner } from "@/presentation/components/spinner";

/** Layout route guard: blocks on session restoration, then requires an authenticated user. */
export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const { isBootstrapping } = useSessionBootstrap();

  if (isBootstrapping) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" label="Restoring your session…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
