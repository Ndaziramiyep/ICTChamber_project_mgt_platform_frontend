import { registerMockServerLifecycleHooks } from "@test/mocks/server";
import { createAuthenticatedHttpClient } from "@test/support/authenticated-client";

import { HttpBoardRepository } from "@/infrastructure/repositories/http-board-repository";

registerMockServerLifecycleHooks();

describe("HttpBoardRepository", () => {
  it("creates and lists boards for the authenticated user", async () => {
    const repository = new HttpBoardRepository(await createAuthenticatedHttpClient());

    const created = await repository.createBoard({
      title: "Sprint 12",
      description: "Backend sprint board",
    });
    expect(created).toMatchObject({ title: "Sprint 12", description: "Backend sprint board" });

    const boards = await repository.listBoards();
    expect(boards).toHaveLength(1);
    expect(boards[0]?.boardId).toBe(created.boardId);
  });

  it("gets, updates, and deletes a board", async () => {
    const repository = new HttpBoardRepository(await createAuthenticatedHttpClient());
    const created = await repository.createBoard({ title: "Sprint 12" });

    const fetched = await repository.getBoardById(created.boardId);
    expect(fetched.title).toBe("Sprint 12");

    const updated = await repository.updateBoard(created.boardId, {
      title: "Sprint 13",
      description: "Renamed",
    });
    expect(updated).toMatchObject({ title: "Sprint 13", description: "Renamed" });

    await repository.deleteBoard(created.boardId);
    await expect(repository.getBoardById(created.boardId)).rejects.toMatchObject({
      httpStatus: 404,
    });
  });

  it("rejects reading another user's board with a 403 ApiError", async () => {
    const ownerRepository = new HttpBoardRepository(await createAuthenticatedHttpClient());
    const board = await ownerRepository.createBoard({ title: "Owner-only board" });

    const intruderRepository = new HttpBoardRepository(await createAuthenticatedHttpClient());

    await expect(intruderRepository.getBoardById(board.boardId)).rejects.toMatchObject({
      httpStatus: 403,
      errorCode: "ForbiddenError",
    });
  });
});
