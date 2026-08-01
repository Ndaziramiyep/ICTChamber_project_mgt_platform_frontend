import type { ReactNode } from "react";

import { Card } from "@/presentation/components/card";
import { ThemeToggle } from "@/presentation/components/theme-toggle";

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-center text-2xl font-bold text-brand-600 dark:text-brand-400">
            ICT Chamber Kanban
          </h1>
          <ThemeToggle />
        </div>
        <Card className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          ) : null}
          <div className="mt-6">{children}</div>
        </Card>
      </div>
    </div>
  );
}
