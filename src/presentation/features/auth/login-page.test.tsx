import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import { Toaster } from "@/presentation/components/toaster";
import { LoginPage } from "@/presentation/features/auth/login-page";
import {
  createFakeRepositories,
  renderWithProviders,
  resetAuthStore,
} from "@test/support/render-with-providers";

function renderLoginPage(repositories = createFakeRepositories()) {
  return renderWithProviders(
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/boards" element={<p>Boards page</p>} />
      </Routes>
    </>,
    { repositories, initialEntries: ["/login"] },
  );
}

describe("LoginPage", () => {
  afterEach(resetAuthStore);

  it("shows validation errors when submitted empty", async () => {
    renderLoginPage();

    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
  });

  it("navigates to the boards page after a successful sign-in", async () => {
    const repositories = createFakeRepositories();
    await repositories.authRepository.register({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
      displayName: "Jane Doe",
    });
    renderLoginPage(repositories);

    await userEvent.type(screen.getByLabelText("Email address"), "jane@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "at-least-8-characters");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Boards page")).toBeInTheDocument();
  });

  it("shows an error toast on invalid credentials and stays on the page", async () => {
    renderLoginPage();

    await userEvent.type(screen.getByLabelText("Email address"), "nobody@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(screen.getByText("Incorrect email or password.")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Boards page")).not.toBeInTheDocument();
  });
});
