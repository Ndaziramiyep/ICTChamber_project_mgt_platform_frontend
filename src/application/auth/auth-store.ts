import { create } from "zustand";

import type { User } from "@/domain/entities/user";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

/**
 * Holds the current user's profile for the UI, in memory only — nothing is persisted to
 * `localStorage` or any other client storage. On every app load, {@link useSessionBootstrap}
 * re-derives this from `GET /auth/me`, so the database is always the source of truth for who's
 * signed in, never a cached copy sitting in the browser.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
