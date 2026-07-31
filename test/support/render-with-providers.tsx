import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

import { useAuthStore } from "@/application/auth/auth-store";
import { RepositoryProvider, type Repositories } from "@/application/repository-provider";

import {
  FakeAuthRepository,
  FakeBoardRepository,
  FakeColumnRepository,
  FakeTaskRepository,
  FakeTokenStorage,
} from "./fake-repositories";

export function createFakeRepositories(overrides: Partial<Repositories> = {}): Repositories {
  const columnRepository = new FakeColumnRepository();
  return {
    authRepository: new FakeAuthRepository(),
    boardRepository: new FakeBoardRepository(),
    columnRepository,
    taskRepository: new FakeTaskRepository(columnRepository),
    tokenStorage: new FakeTokenStorage(),
    ...overrides,
  };
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

/** Resets the zustand auth store between tests — it's a module singleton, not provider-scoped. */
export function resetAuthStore(): void {
  useAuthStore.setState({ user: null });
  localStorage.removeItem("ictchamber.auth.user");
}

export function createProvidersWrapper(
  repositories: Repositories = createFakeRepositories(),
  queryClient: QueryClient = createTestQueryClient(),
  initialEntries: string[] = ["/"],
) {
  return function ProvidersWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider repositories={repositories}>
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </RepositoryProvider>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options: {
    repositories?: Repositories;
    queryClient?: QueryClient;
    initialEntries?: string[];
  } & Omit<RenderOptions, "wrapper"> = {},
) {
  const {
    repositories = createFakeRepositories(),
    queryClient = createTestQueryClient(),
    initialEntries = ["/"],
    ...renderOptions
  } = options;
  return render(ui, {
    wrapper: createProvidersWrapper(repositories, queryClient, initialEntries),
    ...renderOptions,
  });
}
