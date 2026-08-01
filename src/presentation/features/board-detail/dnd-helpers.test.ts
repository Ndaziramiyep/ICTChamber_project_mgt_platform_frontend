import { resolveTaskDropTarget } from "@/presentation/features/board-detail/dnd-helpers";

describe("resolveTaskDropTarget", () => {
  it("returns null when there is no drop target", () => {
    expect(resolveTaskDropTarget(null, {})).toBeNull();
  });

  it("returns null when the drop target has no column-id data", () => {
    expect(resolveTaskDropTarget({ id: "x", data: { current: undefined } }, {})).toBeNull();
  });

  it("resolves the end of the column when dropped on a column-container", () => {
    const over = {
      id: "container-a",
      data: { current: { type: "column-container" as const, columnId: "a" } },
    };
    const columnTaskIds = { a: ["t1", "t2"] };

    expect(resolveTaskDropTarget(over, columnTaskIds)).toEqual({ columnId: "a", index: 2 });
  });

  it("resolves the index of the task dropped on", () => {
    const over = { id: "t2", data: { current: { type: "task" as const, columnId: "a" } } };
    const columnTaskIds = { a: ["t1", "t2", "t3"] };

    expect(resolveTaskDropTarget(over, columnTaskIds)).toEqual({ columnId: "a", index: 1 });
  });

  it("falls back to appending when the dropped-on task id is not found in the tracked order", () => {
    const over = {
      id: "unknown-task",
      data: { current: { type: "task" as const, columnId: "a" } },
    };
    const columnTaskIds = { a: ["t1", "t2"] };

    expect(resolveTaskDropTarget(over, columnTaskIds)).toEqual({ columnId: "a", index: 2 });
  });

  it("treats a missing column entry as an empty column", () => {
    const over = {
      id: "container-b",
      data: { current: { type: "column-container" as const, columnId: "b" } },
    };

    expect(resolveTaskDropTarget(over, {})).toEqual({ columnId: "b", index: 0 });
  });
});
