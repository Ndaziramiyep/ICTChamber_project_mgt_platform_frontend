import {
  createFakeRepositories,
  createProvidersWrapper,
  createTestQueryClient,
} from "@test/support/render-with-providers";
import { renderHook, waitFor, act } from "@testing-library/react";

import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useTasksQuery,
  useUpdateTaskMutation,
} from "@/application/tasks/use-tasks";

describe("task hooks", () => {
  it("creates a task and reflects it in the column's task list", async () => {
    const repositories = createFakeRepositories();
    const board = await repositories.boardRepository.createBoard({ title: "Sprint 12" });
    const column = await repositories.columnRepository.createColumn(board.boardId, {
      title: "To Do",
    });
    const queryClient = createTestQueryClient();
    const wrapper = createProvidersWrapper(repositories, queryClient);

    const list = renderHook(() => useTasksQuery(column.columnId), { wrapper });
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true));

    const create = renderHook(() => useCreateTaskMutation(column.columnId), { wrapper });
    act(() => create.result.current.mutate({ title: "Wire up login form" }));

    await waitFor(() => expect(create.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(list.result.current.data).toHaveLength(1));
    expect(list.result.current.data?.[0]).toMatchObject({ title: "Wire up login form" });
  });

  it("edits a task's title and description", async () => {
    const repositories = createFakeRepositories();
    const board = await repositories.boardRepository.createBoard({ title: "Sprint 12" });
    const column = await repositories.columnRepository.createColumn(board.boardId, {
      title: "To Do",
    });
    const task = await repositories.taskRepository.createTask(column.columnId, {
      title: "Wire up login form",
    });
    const wrapper = createProvidersWrapper(repositories);

    const update = renderHook(() => useUpdateTaskMutation(), { wrapper });
    act(() =>
      update.result.current.mutate({
        taskId: task.taskId,
        draft: { title: "Wire up login form (done)" },
      }),
    );

    await waitFor(() => expect(update.result.current.isSuccess).toBe(true));
    expect(update.result.current.data?.title).toBe("Wire up login form (done)");
  });

  it("deletes a task and removes it from the column's task list", async () => {
    const repositories = createFakeRepositories();
    const board = await repositories.boardRepository.createBoard({ title: "Sprint 12" });
    const column = await repositories.columnRepository.createColumn(board.boardId, {
      title: "To Do",
    });
    const task = await repositories.taskRepository.createTask(column.columnId, {
      title: "Wire up login form",
    });
    const wrapper = createProvidersWrapper(repositories);

    const list = renderHook(() => useTasksQuery(column.columnId), { wrapper });
    await waitFor(() => expect(list.result.current.data).toHaveLength(1));

    const deleteHook = renderHook(() => useDeleteTaskMutation(), { wrapper });
    act(() => deleteHook.result.current.mutate({ taskId: task.taskId, columnId: column.columnId }));

    await waitFor(() => expect(deleteHook.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(list.result.current.data).toHaveLength(0));
  });
});
