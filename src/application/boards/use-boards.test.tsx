import {
  createFakeRepositories,
  createProvidersWrapper,
} from "@test/support/render-with-providers";
import { renderHook, waitFor, act } from "@testing-library/react";

import {
  useBoardsQuery,
  useCreateBoardMutation,
  useDeleteBoardMutation,
  useUpdateBoardMutation,
} from "@/application/boards/use-boards";

describe("board hooks", () => {
  it("lists boards and reflects a newly created board after invalidation", async () => {
    const repositories = createFakeRepositories();
    const wrapper = createProvidersWrapper(repositories);

    const list = renderHook(() => useBoardsQuery(), { wrapper });
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
    expect(list.result.current.data).toEqual([]);

    const create = renderHook(() => useCreateBoardMutation(), { wrapper });
    act(() =>
      create.result.current.mutate({ title: "Sprint 12", description: "Backend sprint board" }),
    );
    await waitFor(() => expect(create.result.current.isSuccess).toBe(true));

    await waitFor(() => expect(list.result.current.data).toHaveLength(1));
    expect(list.result.current.data?.[0]).toMatchObject({ title: "Sprint 12" });
  });

  it("updates a board and reflects the new title", async () => {
    const repositories = createFakeRepositories();
    const board = await repositories.boardRepository.createBoard({ title: "Sprint 12" });
    const wrapper = createProvidersWrapper(repositories);

    const update = renderHook(() => useUpdateBoardMutation(), { wrapper });
    act(() =>
      update.result.current.mutate({ boardId: board.boardId, draft: { title: "Sprint 13" } }),
    );

    await waitFor(() => expect(update.result.current.isSuccess).toBe(true));
    expect(update.result.current.data?.title).toBe("Sprint 13");
  });

  it("deletes a board and removes it from the list", async () => {
    const repositories = createFakeRepositories();
    const board = await repositories.boardRepository.createBoard({ title: "Sprint 12" });
    const wrapper = createProvidersWrapper(repositories);

    const list = renderHook(() => useBoardsQuery(), { wrapper });
    await waitFor(() => expect(list.result.current.data).toHaveLength(1));

    const deleteHook = renderHook(() => useDeleteBoardMutation(), { wrapper });
    act(() => deleteHook.result.current.mutate(board.boardId));

    await waitFor(() => expect(deleteHook.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(list.result.current.data).toHaveLength(0));
  });
});
