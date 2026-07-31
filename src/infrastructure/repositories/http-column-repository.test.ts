import { registerMockServerLifecycleHooks } from "@test/mocks/server";
import { createAuthenticatedHttpClient } from "@test/support/authenticated-client";

import { HttpBoardRepository } from "@/infrastructure/repositories/http-board-repository";
import { HttpColumnRepository } from "@/infrastructure/repositories/http-column-repository";

registerMockServerLifecycleHooks();

describe("HttpColumnRepository", () => {
  it("creates columns under a board in ascending display order", async () => {
    const httpClient = await createAuthenticatedHttpClient();
    const board = await new HttpBoardRepository(httpClient).createBoard({ title: "Sprint 12" });
    const columnRepository = new HttpColumnRepository(httpClient);

    await columnRepository.createColumn(board.boardId, { title: "To Do" });
    await columnRepository.createColumn(board.boardId, { title: "In Progress" });

    const columns = await columnRepository.listColumnsByBoard(board.boardId);
    expect(columns.map((column) => column.title)).toEqual(["To Do", "In Progress"]);
    expect(columns[0]!.displayOrder).toBeLessThan(columns[1]!.displayOrder);
  });

  it("renames and deletes a column", async () => {
    const httpClient = await createAuthenticatedHttpClient();
    const board = await new HttpBoardRepository(httpClient).createBoard({ title: "Sprint 12" });
    const columnRepository = new HttpColumnRepository(httpClient);
    const column = await columnRepository.createColumn(board.boardId, { title: "To Do" });

    const renamed = await columnRepository.updateColumn(column.columnId, { title: "Backlog" });
    expect(renamed.title).toBe("Backlog");

    await columnRepository.deleteColumn(column.columnId);
    await expect(columnRepository.getColumnById(column.columnId)).rejects.toMatchObject({
      httpStatus: 404,
    });
  });

  it("cascades: deleting a board deletes its columns", async () => {
    const httpClient = await createAuthenticatedHttpClient();
    const board = await new HttpBoardRepository(httpClient).createBoard({ title: "Sprint 12" });
    const columnRepository = new HttpColumnRepository(httpClient);
    const column = await columnRepository.createColumn(board.boardId, { title: "To Do" });

    await new HttpBoardRepository(httpClient).deleteBoard(board.boardId);

    await expect(columnRepository.getColumnById(column.columnId)).rejects.toMatchObject({
      httpStatus: 404,
    });
  });

  it("rejects operating on a column under another user's board with a 403 ApiError", async () => {
    const ownerClient = await createAuthenticatedHttpClient();
    const board = await new HttpBoardRepository(ownerClient).createBoard({
      title: "Owner-only board",
    });
    const column = await new HttpColumnRepository(ownerClient).createColumn(board.boardId, {
      title: "To Do",
    });

    const intruderClient = await createAuthenticatedHttpClient();
    await expect(
      new HttpColumnRepository(intruderClient).getColumnById(column.columnId),
    ).rejects.toMatchObject({
      httpStatus: 403,
    });
  });
});
