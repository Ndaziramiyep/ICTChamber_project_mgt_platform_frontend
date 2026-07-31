import type { ReactNode } from "react";

import { Card } from "@/presentation/components/card";

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-brand-600">ICT Chamber Kanban</h1>
        <Card className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </Card>
      </div>
    </div>
  );
}
