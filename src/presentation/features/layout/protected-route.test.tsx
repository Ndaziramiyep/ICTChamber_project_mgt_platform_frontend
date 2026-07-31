import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";

import { useAuthStore } from "@/application/auth/auth-store";
import { ProtectedRoute } from "@/presentation/features/layout/protected-route";
import { buildFakeUser } from "@test/support/fake-repositories";
import {
  createFakeRepositories,
  renderWithProviders,
  resetAuthStore,
} from "@test/support/render-with-providers";

function renderProtected(repositories = createFakeRepositories(), initialEntries = ["/boards"]) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<p>Login page</p>} />
      <Route element={<ProtectedRoute />}>
        <Route path="/boards" element={<p>Boards page</p>} />
      </Route>
    </Routes>,
    { repositories, initialEntries },
  );
}

describe("ProtectedRoute", () => {
  afterEach(resetAuthStore);

  it("redirects to /login when there is no stored session", async () => {
    renderProtected();
    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });

  it("renders the protected route once a session is restored", async () => {
    const repositories = createFakeRepositories();
    const user = await repositories.authRepository.register({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
      displayName: "Jane Doe",
    });
    const session = await repositories.authRepository.login({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
    });
    repositories.tokenStorage.saveTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });

    renderProtected(repositories);

    expect(await screen.findByText("Boards page")).toBeInTheDocument();
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it("renders the protected route immediately when a user is already set (no stored tokens needed)", async () => {
    useAuthStore.getState().setUser(buildFakeUser());
    renderProtected();

    expect(await screen.findByText("Boards page")).toBeInTheDocument();
  });
});
