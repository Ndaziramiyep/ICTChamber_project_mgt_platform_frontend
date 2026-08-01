import { create } from "zustand";

export type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/**
 * In memory only — deliberately not persisted to `localStorage`/`sessionStorage`. The theme
 * resets to the OS/browser preference (`prefers-color-scheme`) on every reload; a manual toggle
 * only overrides it for the current tab session.
 */
export const useThemeStore = create<ThemeState>()((set) => ({
  theme: getSystemTheme(),
  toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
  setTheme: (theme) => set({ theme }),
}));
