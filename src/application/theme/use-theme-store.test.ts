import { useThemeStore } from "@/application/theme/use-theme-store";

describe("useThemeStore", () => {
  afterEach(() => {
    useThemeStore.setState({ theme: "light" });
  });

  it("starts with a valid theme", () => {
    expect(["light", "dark"]).toContain(useThemeStore.getState().theme);
  });

  it("setTheme sets an explicit theme", () => {
    useThemeStore.getState().setTheme("dark");
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("toggleTheme flips light to dark and back", () => {
    useThemeStore.getState().setTheme("light");
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe("dark");
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe("light");
  });
});
