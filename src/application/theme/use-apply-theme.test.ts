import { renderHook } from "@testing-library/react";

import { useApplyTheme } from "@/application/theme/use-apply-theme";
import { useThemeStore } from "@/application/theme/use-theme-store";

describe("useApplyTheme", () => {
  afterEach(() => {
    useThemeStore.setState({ theme: "light" });
    document.documentElement.classList.remove("dark");
  });

  it("adds the dark class to <html> when the theme is dark", () => {
    useThemeStore.setState({ theme: "dark" });
    renderHook(() => useApplyTheme());

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes the dark class from <html> when the theme is light", () => {
    document.documentElement.classList.add("dark");
    useThemeStore.setState({ theme: "light" });
    renderHook(() => useApplyTheme());

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
