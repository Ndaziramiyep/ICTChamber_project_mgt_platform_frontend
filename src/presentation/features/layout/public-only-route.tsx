import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/application/auth/auth-store";
import { useSessionBootstrap } from "@/application/auth/use-session-bootstrap";
import { Spinner } from "@/presentation/components/spinner";

/** Layout route guard for /login and /register: sends already-authenticated users to /boards. */
export function PublicOnlyRoute() {
  const user = useAuthStore((state) => state.user);
  const { isBootstrapping } = useSessionBootstrap();

  if (isBootstrapping) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" label="Loading…" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/boards" replace />;
  }

  return <Outlet />;
}
