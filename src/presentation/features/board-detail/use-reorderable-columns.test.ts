import { act, renderHook } from "@testing-library/react";

import type { KanbanColumn } from "@/domain/entities/column";
import { useReorderableColumns } from "@/presentation/features/board-detail/use-reorderable-columns";

function buildColumn(overrides: Partial<KanbanColumn> = {}): KanbanColumn {
  return {
    columnId: "column-1",
    parentBoardId: "board-1",
    title: "Backlog",
    displayOrder: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("useReorderableColumns", () => {
  it("starts in the server-provided order", () => {
    const columns = [
      buildColumn({ columnId: "a", title: "Backlog" }),
      buildColumn({ columnId: "b", title: "Doing" }),
      buildColumn({ columnId: "c", title: "Done" }),
    ];
    const { result } = renderHook(() => useReorderableColumns(columns));

    expect(result.current.orderedColumns.map((column) => column.columnId)).toEqual(["a", "b", "c"]);
  });

  it("moves a column to sit where another column currently is", () => {
    const columns = [
      buildColumn({ columnId: "a" }),
      buildColumn({ columnId: "b" }),
      buildColumn({ columnId: "c" }),
    ];
    const { result } = renderHook(() => useReorderableColumns(columns));

    act(() => result.current.reorderColumns("a", "c"));

    expect(result.current.orderedColumns.map((column) => column.columnId)).toEqual(["b", "c", "a"]);
  });

  it("returns the resulting order so the caller can persist it without waiting on a rerender", () => {
    const columns = [
      buildColumn({ columnId: "a" }),
      buildColumn({ columnId: "b" }),
      buildColumn({ columnId: "c" }),
    ];
    const { result } = renderHook(() => useReorderableColumns(columns));

    let returnedOrder: string[] | null = null;
    act(() => {
      returnedOrder = result.current.reorderColumns("a", "c");
    });

    expect(returnedOrder).toEqual(["b", "c", "a"]);
  });

  it("returns null for a no-op reorder", () => {
    const columns = [buildColumn({ columnId: "a" }), buildColumn({ columnId: "b" })];
    const { result } = renderHook(() => useReorderableColumns(columns));

    let returnedOrder: string[] | null = ["placeholder"];
    act(() => {
      returnedOrder = result.current.reorderColumns("a", "a");
    });

    expect(returnedOrder).toBeNull();
  });

  it("ignores a reorder referencing an unknown column id", () => {
    const columns = [buildColumn({ columnId: "a" }), buildColumn({ columnId: "b" })];
    const { result } = renderHook(() => useReorderableColumns(columns));

    act(() => result.current.reorderColumns("a", "missing"));

    expect(result.current.orderedColumns.map((column) => column.columnId)).toEqual(["a", "b"]);
  });

  it("resetToServerOrder discards a local reorder and snaps back to server order", () => {
    const columns = [
      buildColumn({ columnId: "a" }),
      buildColumn({ columnId: "b" }),
      buildColumn({ columnId: "c" }),
    ];
    const { result } = renderHook(() => useReorderableColumns(columns));

    act(() => {
      result.current.reorderColumns("a", "c");
    });
    expect(result.current.orderedColumns.map((column) => column.columnId)).toEqual(["b", "c", "a"]);

    act(() => result.current.resetToServerOrder());

    expect(result.current.orderedColumns.map((column) => column.columnId)).toEqual(["a", "b", "c"]);
  });

  it("appends a newly created column after preserving a manual reorder", () => {
    const columns = [buildColumn({ columnId: "a" }), buildColumn({ columnId: "b" })];
    const { result, rerender } = renderHook(({ cols }) => useReorderableColumns(cols), {
      initialProps: { cols: columns },
    });

    act(() => result.current.reorderColumns("a", "b"));
    expect(result.current.orderedColumns.map((column) => column.columnId)).toEqual(["b", "a"]);

    rerender({ cols: [...columns, buildColumn({ columnId: "c" })] });

    expect(result.current.orderedColumns.map((column) => column.columnId)).toEqual(["b", "a", "c"]);
  });

  it("drops a column that no longer exists on the server", () => {
    const columns = [
      buildColumn({ columnId: "a" }),
      buildColumn({ columnId: "b" }),
      buildColumn({ columnId: "c" }),
    ];
    const { result, rerender } = renderHook(({ cols }) => useReorderableColumns(cols), {
      initialProps: { cols: columns },
    });

    rerender({ cols: columns.filter((column) => column.columnId !== "b") });

    expect(result.current.orderedColumns.map((column) => column.columnId)).toEqual(["a", "c"]);
  });
});
