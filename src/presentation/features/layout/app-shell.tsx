import { LogOut } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/application/auth/auth-store";
import { useLogoutAction } from "@/application/auth/use-logout-action";
import { Button } from "@/presentation/components/button";
import { ThemeToggle } from "@/presentation/components/theme-toggle";

/** App-wide chrome for authenticated routes: top nav with branding, current user, and logout. */
export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogoutAction();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen flex-col">
      <nav className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
        <Link to="/boards" className="text-lg font-bold text-brand-600 dark:text-brand-400">
          ICT Chamber Kanban
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <span className="mr-2 text-sm text-slate-600 dark:text-slate-300">
              {user.displayName}
            </span>
          ) : null}
          <ThemeToggle />
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </Button>
        </div>
      </nav>
      <main className="flex-1 overflow-auto dark:bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
}
