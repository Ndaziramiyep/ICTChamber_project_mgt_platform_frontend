import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";

import { useAuthStore } from "@/application/auth/auth-store";
import { PublicOnlyRoute } from "@/presentation/features/layout/public-only-route";
import { buildFakeUser } from "@test/support/fake-repositories";
import {
  createFakeRepositories,
  renderWithProviders,
  resetAuthStore,
} from "@test/support/render-with-providers";

function renderPublicOnly(initialEntries = ["/login"]) {
  return renderWithProviders(
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<p>Login page</p>} />
      </Route>
      <Route path="/boards" element={<p>Boards page</p>} />
    </Routes>,
    { repositories: createFakeRepositories(), initialEntries },
  );
}

describe("PublicOnlyRoute", () => {
  afterEach(resetAuthStore);

  it("renders the public route when there is no authenticated user", async () => {
    renderPublicOnly();
    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });

  it("redirects an authenticated user to /boards", async () => {
    useAuthStore.getState().setUser(buildFakeUser());
    renderPublicOnly();

    expect(await screen.findByText("Boards page")).toBeInTheDocument();
  });
});
