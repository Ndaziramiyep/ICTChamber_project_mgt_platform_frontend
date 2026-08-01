import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useThemeStore } from "@/application/theme/use-theme-store";
import { ThemeToggle } from "@/presentation/components/theme-toggle";

describe("ThemeToggle", () => {
  afterEach(() => {
    useThemeStore.setState({ theme: "light" });
  });

  it("toggles the theme when clicked", async () => {
    useThemeStore.setState({ theme: "light" });
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));

    expect(useThemeStore.getState().theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  });
});
