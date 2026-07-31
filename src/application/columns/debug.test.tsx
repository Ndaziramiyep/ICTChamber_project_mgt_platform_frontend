import {
  createFakeRepositories,
  createProvidersWrapper,
} from "@test/support/render-with-providers";
import { renderHook, waitFor, act } from "@testing-library/react";

import { useColumnsQuery, useCreateColumnMutation } from "@/application/columns/use-columns";

describe("debug", () => {
  it("debug column invalidation", async () => {
    const repositories = createFakeRepositories();
    const board = await repositories.boardRepository.createBoard({ title: "Sprint 12" });
    const wrapper = createProvidersWrapper(repositories);

    const list = renderHook(() => useColumnsQuery(board.boardId), { wrapper });
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
    console.log("initial", list.result.current.data, list.result.current.dataUpdatedAt);

    const create = renderHook(() => useCreateColumnMutation(board.boardId), { wrapper });
    act(() => create.result.current.mutate({ title: "To Do" }));

    await waitFor(() => expect(create.result.current.isSuccess).toBe(true));
    console.log("create success", create.result.current.data);
    console.log(
      "repo columns array",
      repositories.columnRepository.listColumnsByBoard(board.boardId),
    );

    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(
      "after wait",
      list.result.current.data,
      list.result.current.dataUpdatedAt,
      list.result.current.fetchStatus,
      list.result.current.status,
    );
  });
});
