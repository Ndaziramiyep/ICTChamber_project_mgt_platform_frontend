import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "@/App";
import { registerMockServerLifecycleHooks } from "@test/mocks/server";

/**
 * Exercises the real App.tsx composition — real HTTP repositories talking to the MSW mock
 * backend, real routing guards, real auth store — rather than the fakes the unit tests use.
 * This is the one place wiring mistakes (missed providers, misconfigured routes) would surface.
 */
registerMockServerLifecycleHooks();

describe("App golden path", () => {
  it("registers, signs in, and manages a board's columns and tasks end to end", async () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    // Unauthenticated visitors land on the login page; navigate to registration.
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("link", { name: "Create one" }));

    // Register a new account — this logs the user in and lands on /boards.
    await userEvent.type(screen.getByLabelText("Display name"), "Jane Doe");
    await userEvent.type(screen.getByLabelText("Email address"), "jane@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "at-least-8-characters");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("heading", { name: "Your boards" })).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();

    // Create a board and open it.
    await userEvent.click(screen.getByRole("button", { name: "New board" }));
    await userEvent.type(screen.getByLabelText("Title"), "Sprint 12");
    await userEvent.click(screen.getByRole("button", { name: "Create board" }));
    await userEvent.click(await screen.findByRole("link", { name: "Sprint 12" }));

    expect(await screen.findByRole("heading", { name: "Sprint 12" })).toBeInTheDocument();

    // Add a column and a task inside it.
    await userEvent.click(screen.getByRole("button", { name: "Add a column" }));
    await userEvent.type(screen.getByLabelText("Title"), "To Do");
    await userEvent.click(screen.getByRole("button", { name: "Add column" }));
    expect(await screen.findByRole("heading", { name: "To Do" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Add task" }));
    await userEvent.type(screen.getByLabelText("Title"), "Wire up login form");
    await userEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(await screen.findByText("Wire up login form")).toBeInTheDocument();

    // Log out and confirm the app returns to the login page with the session cleared.
    await userEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();

    // Logging back in restores the board exactly as it was left.
    await userEvent.type(screen.getByLabelText("Email address"), "jane@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "at-least-8-characters");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await userEvent.click(await screen.findByRole("link", { name: "Sprint 12" }));
    await waitFor(() => expect(screen.getByText("Wire up login form")).toBeInTheDocument());

    // Deleting the board cascades: the board disappears from the list entirely.
    await userEvent.click(screen.getByRole("link", { name: "All boards" }));
    await userEvent.click(await screen.findByRole("button", { name: "Delete Sprint 12" }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(await screen.findByText("No boards yet")).toBeInTheDocument();
  }, 20000);
});
