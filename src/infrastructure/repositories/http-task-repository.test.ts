import { HttpBoardRepository } from "@/infrastructure/repositories/http-board-repository";
import { HttpColumnRepository } from "@/infrastructure/repositories/http-column-repository";
import { HttpTaskRepository } from "@/infrastructure/repositories/http-task-repository";
import { registerMockServerLifecycleHooks } from "@test/mocks/server";
import { createAuthenticatedHttpClient } from "@test/support/authenticated-client";

registerMockServerLifecycleHooks();

async function createColumnInNewBoard(
  httpClient: Awaited<ReturnType<typeof createAuthenticatedHttpClient>>,
) {
  const board = await new HttpBoardRepository(httpClient).createBoard({ title: "Sprint 12" });
  return new HttpColumnRepository(httpClient).createColumn(board.boardId, { title: "To Do" });
}

describe("HttpTaskRepository", () => {
  it("creates tasks under a column in ascending position order", async () => {
    const httpClient = await createAuthenticatedHttpClient();
    const column = await createColumnInNewBoard(httpClient);
    const taskRepository = new HttpTaskRepository(httpClient);

    await taskRepository.createTask(column.columnId, { title: "Wire up login form" });
    await taskRepository.createTask(column.columnId, { title: "Wire up register form" });

    const tasks = await taskRepository.listTasksByColumn(column.columnId);
    expect(tasks.map((task) => task.title)).toEqual([
      "Wire up login form",
      "Wire up register form",
    ]);
    expect(tasks[0]!.positionValue).toBeLessThan(tasks[1]!.positionValue);
    expect(tasks[0]!.parentBoardId).toBe(column.parentBoardId);
  });

  it("edits and deletes a task", async () => {
    const httpClient = await createAuthenticatedHttpClient();
    const column = await createColumnInNewBoard(httpClient);
    const taskRepository = new HttpTaskRepository(httpClient);
    const task = await taskRepository.createTask(column.columnId, {
      title: "Wire up login form",
      description: "Use the /auth/login endpoint",
    });

    const updated = await taskRepository.updateTask(task.taskId, {
      title: "Wire up login form (done)",
      description: null,
    });
    expect(updated).toMatchObject({ title: "Wire up login form (done)", description: null });

    await taskRepository.deleteTask(task.taskId);
    await expect(taskRepository.getTaskById(task.taskId)).rejects.toMatchObject({
      httpStatus: 404,
    });
  });

  it("cascades: deleting a column deletes its tasks", async () => {
    const httpClient = await createAuthenticatedHttpClient();
    const column = await createColumnInNewBoard(httpClient);
    const taskRepository = new HttpTaskRepository(httpClient);
    const task = await taskRepository.createTask(column.columnId, { title: "Wire up login form" });

    await new HttpColumnRepository(httpClient).deleteColumn(column.columnId);

    await expect(taskRepository.getTaskById(task.taskId)).rejects.toMatchObject({
      httpStatus: 404,
    });
  });

  it("rejects operating on a task under another user's board with a 403 ApiError", async () => {
    const ownerClient = await createAuthenticatedHttpClient();
    const column = await createColumnInNewBoard(ownerClient);
    const task = await new HttpTaskRepository(ownerClient).createTask(column.columnId, {
      title: "Owner-only task",
    });

    const intruderClient = await createAuthenticatedHttpClient();
    await expect(
      new HttpTaskRepository(intruderClient).getTaskById(task.taskId),
    ).rejects.toMatchObject({
      httpStatus: 403,
    });
  });

  it("repositions a task between two siblings in the same column", async () => {
    const httpClient = await createAuthenticatedHttpClient();
    const column = await createColumnInNewBoard(httpClient);
    const taskRepository = new HttpTaskRepository(httpClient);
    const first = await taskRepository.createTask(column.columnId, { title: "First" });
    const second = await taskRepository.createTask(column.columnId, { title: "Second" });
    const third = await taskRepository.createTask(column.columnId, { title: "Third" });

    const repositioned = await taskRepository.repositionTask(third.taskId, {
      targetColumnId: column.columnId,
      previousTaskId: first.taskId,
      nextTaskId: second.taskId,
    });

    expect(repositioned.positionValue).toBeGreaterThan(first.positionValue);
    expect(repositioned.positionValue).toBeLessThan(second.positionValue);
    const tasks = await taskRepository.listTasksByColumn(column.columnId);
    expect(tasks.map((task) => task.taskId)).toEqual([first.taskId, third.taskId, second.taskId]);
  });

  it("moves a task into a different column", async () => {
    const httpClient = await createAuthenticatedHttpClient();
    const boardRepository = new HttpBoardRepository(httpClient);
    const columnRepository = new HttpColumnRepository(httpClient);
    const taskRepository = new HttpTaskRepository(httpClient);
    const board = await boardRepository.createBoard({ title: "Sprint 12" });
    const columnA = await columnRepository.createColumn(board.boardId, { title: "To Do" });
    const columnB = await columnRepository.createColumn(board.boardId, { title: "Done" });
    const task = await taskRepository.createTask(columnA.columnId, { title: "Wire up login" });

    const moved = await taskRepository.repositionTask(task.taskId, {
      targetColumnId: columnB.columnId,
    });

    expect(moved.parentColumnId).toBe(columnB.columnId);
    expect(await taskRepository.listTasksByColumn(columnA.columnId)).toEqual([]);
    expect((await taskRepository.listTasksByColumn(columnB.columnId)).map((t) => t.taskId)).toEqual(
      [task.taskId],
    );
  });
});
