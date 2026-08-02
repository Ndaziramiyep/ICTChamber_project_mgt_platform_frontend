import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { useAuthStore } from "@/application/auth/auth-store";
import { createDefaultRepositories, RepositoryProvider } from "@/application/repository-provider";
import { Toaster } from "@/presentation/components/toaster";
import { LoginPage } from "@/presentation/features/auth/login-page";
import { RegisterPage } from "@/presentation/features/auth/register-page";
import { BoardDetailPage } from "@/presentation/features/board-detail/board-detail-page";
import { BoardsListPage } from "@/presentation/features/boards/boards-list-page";
import { AppShell } from "@/presentation/features/layout/app-shell";
import { NotFoundPage } from "@/presentation/features/layout/not-found-page";
import { ProtectedRoute } from "@/presentation/features/layout/protected-route";
import { PublicOnlyRoute } from "@/presentation/features/layout/public-only-route";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

export default function App() {
  const [repositories] = useState(() =>
    createDefaultRepositories(() => useAuthStore.getState().setUser(null)),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider repositories={repositories}>
        <BrowserRouter>
          <Toaster />
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/boards" element={<BoardsListPage />} />
                <Route path="/boards/:boardId" element={<BoardDetailPage />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/boards" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </RepositoryProvider>
    </QueryClientProvider>
  );
}
