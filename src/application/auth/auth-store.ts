import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/domain/entities/user";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

/**
 * Holds the current user's profile for the UI. Deliberately does NOT hold auth tokens — those
 * are owned by {@link TokenStorage} (infrastructure layer) so there is a single source of truth
 * for session credentials. Persisting just the profile lets the app render "signed in as X"
 * immediately on reload, ahead of the `/auth/me` bootstrap call confirming it.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    { name: "ictchamber.auth.user" },
  ),
);
