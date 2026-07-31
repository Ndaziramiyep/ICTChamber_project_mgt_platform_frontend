import {
  createFakeRepositories,
  createProvidersWrapper,
  createTestQueryClient,
} from "@test/support/render-with-providers";
import { renderHook, waitFor, act } from "@testing-library/react";

import {
  useColumnsQuery,
  useCreateColumnMutation,
  useDeleteColumnMutation,
  useUpdateColumnMutation,
} from "@/application/columns/use-columns";

describe("column hooks", () => {
  it("creates a column and reflects it in the board's column list", async () => {
    const repositories = createFakeRepositories();
    const board = await repositories.boardRepository.createBoard({ title: "Sprint 12" });
    const queryClient = createTestQueryClient();
    const wrapper = createProvidersWrapper(repositories, queryClient);

    const list = renderHook(() => useColumnsQuery(board.boardId), { wrapper });
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true));

    const create = renderHook(() => useCreateColumnMutation(board.boardId), { wrapper });
    act(() => create.result.current.mutate({ title: "To Do" }));

    await waitFor(() => expect(create.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(list.result.current.data).toHaveLength(1));
    expect(list.result.current.data?.[0]).toMatchObject({ title: "To Do" });
  });

  it("renames a column", async () => {
    const repositories = createFakeRepositories();
    const board = await repositories.boardRepository.createBoard({ title: "Sprint 12" });
    const column = await repositories.columnRepository.createColumn(board.boardId, {
      title: "To Do",
    });
    const wrapper = createProvidersWrapper(repositories);

    const update = renderHook(() => useUpdateColumnMutation(), { wrapper });
    act(() =>
      update.result.current.mutate({ columnId: column.columnId, draft: { title: "Backlog" } }),
    );

    await waitFor(() => expect(update.result.current.isSuccess).toBe(true));
    expect(update.result.current.data?.title).toBe("Backlog");
  });

  it("deletes a column and removes it from the board's column list", async () => {
    const repositories = createFakeRepositories();
    const board = await repositories.boardRepository.createBoard({ title: "Sprint 12" });
    const column = await repositories.columnRepository.createColumn(board.boardId, {
      title: "To Do",
    });
    const wrapper = createProvidersWrapper(repositories);

    const list = renderHook(() => useColumnsQuery(board.boardId), { wrapper });
    await waitFor(() => expect(list.result.current.data).toHaveLength(1));

    const deleteHook = renderHook(() => useDeleteColumnMutation(), { wrapper });
    act(() =>
      deleteHook.result.current.mutate({ columnId: column.columnId, boardId: board.boardId }),
    );

    await waitFor(() => expect(deleteHook.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(list.result.current.data).toHaveLength(0));
  });
});
