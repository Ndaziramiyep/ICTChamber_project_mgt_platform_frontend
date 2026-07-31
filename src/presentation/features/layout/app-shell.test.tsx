import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import { useAuthStore } from "@/application/auth/auth-store";
import { AppShell } from "@/presentation/features/layout/app-shell";
import { buildFakeUser } from "@test/support/fake-repositories";
import {
  createFakeRepositories,
  renderWithProviders,
  resetAuthStore,
} from "@test/support/render-with-providers";

describe("AppShell", () => {
  afterEach(resetAuthStore);

  it("shows the current user's display name", () => {
    useAuthStore.getState().setUser(buildFakeUser({ displayName: "Jane Doe" }));
    renderWithProviders(
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<p>Page content</p>} />
        </Route>
      </Routes>,
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("clears the session and navigates to /login when logging out", async () => {
    useAuthStore.getState().setUser(buildFakeUser());
    const repositories = createFakeRepositories();
    repositories.tokenStorage.saveTokens({ accessToken: "a", refreshToken: "b" });

    renderWithProviders(
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<p>Page content</p>} />
        </Route>
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>,
      { repositories },
    );

    await userEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(await screen.findByText("Login page")).toBeInTheDocument();
    expect(useAuthStore.getState().user).toBeNull();
    expect(repositories.tokenStorage.getTokens()).toBeNull();
  });
});
