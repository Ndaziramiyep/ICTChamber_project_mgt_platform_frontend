import { useEffect } from "react";

import { useThemeStore } from "@/application/theme/use-theme-store";

/** Syncs the `.dark` class on `<html>` with the current theme — call once near the app root. */
export function useApplyTheme(): void {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
}
