import { createContext, useContext, type ReactNode } from "react";

import type { AuthRepository } from "@/domain/repositories/auth-repository";
import type { BoardRepository } from "@/domain/repositories/board-repository";
import type { ColumnRepository } from "@/domain/repositories/column-repository";
import type { TaskRepository } from "@/domain/repositories/task-repository";
import { createApiClient } from "@/infrastructure/http/api-client";
import { HttpAuthRepository } from "@/infrastructure/repositories/http-auth-repository";
import { HttpBoardRepository } from "@/infrastructure/repositories/http-board-repository";
import { HttpColumnRepository } from "@/infrastructure/repositories/http-column-repository";
import { HttpTaskRepository } from "@/infrastructure/repositories/http-task-repository";
import {
  SessionStorageTokenStorage,
  type TokenStorage,
} from "@/infrastructure/storage/token-storage";

export interface Repositories {
  authRepository: AuthRepository;
  boardRepository: BoardRepository;
  columnRepository: ColumnRepository;
  taskRepository: TaskRepository;
  tokenStorage: TokenStorage;
}

/**
 * Wires the concrete HTTP repositories used by the running app. Kept separate from the React
 * context so it can be constructed once (stable identity) and swapped for fakes in tests.
 */
export function createDefaultRepositories(onSessionExpired: () => void): Repositories {
  const tokenStorage = new SessionStorageTokenStorage();
  const httpClient = createApiClient({ tokenStorage, onSessionExpired });

  return {
    authRepository: new HttpAuthRepository(httpClient),
    boardRepository: new HttpBoardRepository(httpClient),
    columnRepository: new HttpColumnRepository(httpClient),
    taskRepository: new HttpTaskRepository(httpClient),
    tokenStorage,
  };
}

const RepositoryContext = createContext<Repositories | null>(null);

export function RepositoryProvider({
  repositories,
  children,
}: {
  repositories: Repositories;
  children: ReactNode;
}) {
  return <RepositoryContext.Provider value={repositories}>{children}</RepositoryContext.Provider>;
}

/** Dependency-inversion seam: application hooks depend on this, never on the Http* classes directly. */
export function useRepositories(): Repositories {
  const repositories = useContext(RepositoryContext);
  if (!repositories) {
    throw new Error("useRepositories must be used within a RepositoryProvider");
  }
  return repositories;
}
