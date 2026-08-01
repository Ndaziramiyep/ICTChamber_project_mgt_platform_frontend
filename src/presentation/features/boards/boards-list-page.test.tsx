import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "@/domain/errors/api-error";
import { Toaster } from "@/presentation/components/toaster";
import { BoardsListPage } from "@/presentation/features/boards/boards-list-page";
import { createFakeRepositories, renderWithProviders } from "@test/support/render-with-providers";

function renderBoardsListPage(repositories = createFakeRepositories()) {
  return renderWithProviders(
    <>
      <Toaster />
      <BoardsListPage />
    </>,
    { repositories },
  );
}

describe("BoardsListPage", () => {
  it("shows an empty state when there are no boards", async () => {
    renderBoardsListPage();

    expect(await screen.findByText("No boards yet")).toBeInTheDocument();
  });

  it("lists existing boards", async () => {
    const repositories = createFakeRepositories();
    await repositories.boardRepository.createBoard({
      title: "Sprint 12",
      description: "Backend sprint",
    });
    renderBoardsListPage(repositories);

    expect(await screen.findByRole("link", { name: "Sprint 12" })).toBeInTheDocument();
    expect(screen.getByText("Backend sprint")).toBeInTheDocument();
  });

  it("creates a board through the New board modal", async () => {
    renderBoardsListPage();
    await screen.findByText("No boards yet");

    await userEvent.click(screen.getByRole("button", { name: "New board" }));
    await userEvent.type(screen.getByLabelText("Title"), "Sprint 12");
    await userEvent.click(screen.getByRole("button", { name: "Create board" }));

    expect(await screen.findByRole("link", { name: "Sprint 12" })).toBeInTheDocument();
    expect(screen.getByText("Board created.")).toBeInTheDocument();
  });

  it("edits a board's title through the edit modal", async () => {
    const repositories = createFakeRepositories();
    await repositories.boardRepository.createBoard({ title: "Sprint 12" });
    renderBoardsListPage(repositories);
    await screen.findByRole("link", { name: "Sprint 12" });

    await userEvent.click(screen.getByRole("button", { name: "Edit Sprint 12" }));
    const titleInput = screen.getByLabelText("Title");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Sprint 13");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("link", { name: "Sprint 13" })).toBeInTheDocument();
  });

  it("deletes a board after confirming", async () => {
    const repositories = createFakeRepositories();
    await repositories.boardRepository.createBoard({ title: "Sprint 12" });
    renderBoardsListPage(repositories);
    await screen.findByRole("link", { name: "Sprint 12" });

    await userEvent.click(screen.getByRole("button", { name: "Delete Sprint 12" }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Sprint 12" })).not.toBeInTheDocument(),
    );
    expect(await screen.findByText("No boards yet")).toBeInTheDocument();
  });

  it("shows a 422 field-level error next to the title input instead of a toast", async () => {
    const repositories = createFakeRepositories();
    repositories.boardRepository.createBoard = jest.fn().mockRejectedValue(
      new ApiError({
        httpStatus: 422,
        errorCode: "ValidationError",
        message: "Validation failed.",
        validationErrors: [
          { fieldPath: "board_title", message: "Title must be 200 characters or fewer." },
        ],
      }),
    );
    renderBoardsListPage(repositories);
    await screen.findByText("No boards yet");

    await userEvent.click(screen.getByRole("button", { name: "New board" }));
    await userEvent.type(screen.getByLabelText("Title"), "Sprint 12");
    await userEvent.click(screen.getByRole("button", { name: "Create board" }));

    expect(await screen.findByText("Title must be 200 characters or fewer.")).toBeInTheDocument();
    expect(screen.queryByText("Validation failed.")).not.toBeInTheDocument();
  });
});
