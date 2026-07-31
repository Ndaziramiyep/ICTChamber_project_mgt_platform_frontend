import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";

import { Toaster } from "@/presentation/components/toaster";
import { BoardDetailPage } from "@/presentation/features/board-detail/board-detail-page";
import { createFakeRepositories, renderWithProviders } from "@test/support/render-with-providers";

function renderBoardDetailPage(boardId: string, repositories = createFakeRepositories()) {
  return renderWithProviders(
    <>
      <Toaster />
      <Routes>
        <Route path="/boards/:boardId" element={<BoardDetailPage />} />
      </Routes>
    </>,
    { repositories, initialEntries: [`/boards/${boardId}`] },
  );
}

describe("BoardDetailPage", () => {
  it("shows the board header and an empty columns state", async () => {
    const repositories = createFakeRepositories();
    const board = await repositories.boardRepository.createBoard({
      title: "Sprint 12",
      description: "Backend sprint board",
    });
    renderBoardDetailPage(board.boardId, repositories);

    expect(await screen.findByRole("heading", { name: "Sprint 12" })).toBeInTheDocument();
    expect(screen.getByText("Backend sprint board")).toBeInTheDocument();
    expect(screen.getByText("No columns yet")).toBeInTheDocument();
  });

  it("shows an inline error when the board cannot be found", async () => {
    renderBoardDetailPage("missing-board-id");
    expect(await screen.findByText("Not found.")).toBeInTheDocument();
  });

  it("supports the full column and task lifecycle", async () => {
    const repositories = createFakeRepositories();
    const board = await repositories.boardRepository.createBoard({ title: "Sprint 12" });
    renderBoardDetailPage(board.boardId, repositories);
    await screen.findByText("No columns yet");

    // Add a column.
    await userEvent.click(screen.getByRole("button", { name: "Add a column" }));
    await userEvent.type(screen.getByLabelText("Title"), "To Do");
    await userEvent.click(screen.getByRole("button", { name: "Add column" }));
    expect(await screen.findByRole("heading", { name: "To Do" })).toBeInTheDocument();

    // Add a task under that column.
    await userEvent.click(screen.getByRole("button", { name: "Add task" }));
    await userEvent.type(screen.getByLabelText("Title"), "Wire up login form");
    await userEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(await screen.findByText("Wire up login form")).toBeInTheDocument();

    // Edit the task.
    await userEvent.click(screen.getByRole("button", { name: "Edit Wire up login form" }));
    const titleInput = screen.getByLabelText("Title");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Wire up login form (done)");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByText("Wire up login form (done)")).toBeInTheDocument();

    // Delete the task.
    await userEvent.click(screen.getByRole("button", { name: "Delete Wire up login form (done)" }));
    const taskDeleteDialog = screen.getByRole("dialog");
    await userEvent.click(within(taskDeleteDialog).getByRole("button", { name: "Delete" }));
    await waitFor(() =>
      expect(screen.queryByText("Wire up login form (done)")).not.toBeInTheDocument(),
    );

    // Rename the column.
    await userEvent.click(screen.getByRole("button", { name: "Rename To Do" }));
    const columnTitleInput = screen.getByLabelText("Title");
    await userEvent.clear(columnTitleInput);
    await userEvent.type(columnTitleInput, "Backlog");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByRole("heading", { name: "Backlog" })).toBeInTheDocument();

    // Delete the column.
    await userEvent.click(screen.getByRole("button", { name: "Delete Backlog" }));
    const columnDeleteDialog = screen.getByRole("dialog");
    await userEvent.click(within(columnDeleteDialog).getByRole("button", { name: "Delete" }));
    expect(await screen.findByText("No columns yet")).toBeInTheDocument();
  });
});
