import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import { Toaster } from "@/presentation/components/toaster";
import { RegisterPage } from "@/presentation/features/auth/register-page";
import {
  createFakeRepositories,
  renderWithProviders,
  resetAuthStore,
} from "@test/support/render-with-providers";

function renderRegisterPage(repositories = createFakeRepositories()) {
  return renderWithProviders(
    <>
      <Toaster />
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/boards" element={<p>Boards page</p>} />
      </Routes>
    </>,
    { repositories, initialEntries: ["/register"] },
  );
}

describe("RegisterPage", () => {
  afterEach(resetAuthStore);

  it("shows validation errors when submitted empty", async () => {
    renderRegisterPage();

    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Display name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
  });

  it("registers and navigates to the boards page", async () => {
    renderRegisterPage();

    await userEvent.type(screen.getByLabelText("Display name"), "Jane Doe");
    await userEvent.type(screen.getByLabelText("Email address"), "jane@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "at-least-8-characters");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Boards page")).toBeInTheDocument();
  });

  it("shows an error toast when the email is already registered", async () => {
    const repositories = createFakeRepositories();
    await repositories.authRepository.register({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
      displayName: "Jane Doe",
    });
    renderRegisterPage(repositories);

    await userEvent.type(screen.getByLabelText("Display name"), "Jane Again");
    await userEvent.type(screen.getByLabelText("Email address"), "jane@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "another-password");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() =>
      expect(screen.getByText("This email is already registered.")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Boards page")).not.toBeInTheDocument();
  });
});
