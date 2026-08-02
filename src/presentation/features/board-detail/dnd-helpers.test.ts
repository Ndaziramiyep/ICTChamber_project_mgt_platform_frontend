import {
  filterDroppablesByActiveType,
  resolveTaskDropTarget,
} from "@/presentation/features/board-detail/dnd-helpers";

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

describe("filterDroppablesByActiveType", () => {
  const containers = [
    { id: "column-a", data: { current: { type: "column" as const } } },
    { id: "column-b", data: { current: { type: "column" as const } } },
    { id: "container-a", data: { current: { type: "column-container" as const, columnId: "a" } } },
    { id: "task-1", data: { current: { type: "task" as const, columnId: "a" } } },
  ];

  it("restricts a dragged column to colliding only with other columns", () => {
    const filtered = filterDroppablesByActiveType("column", containers);

    expect(filtered.map((container) => container.id)).toEqual(["column-a", "column-b"]);
  });

  it("restricts a dragged task to colliding only with tasks or column-containers", () => {
    const filtered = filterDroppablesByActiveType("task", containers);

    expect(filtered.map((container) => container.id)).toEqual(["container-a", "task-1"]);
  });

  it("passes everything through for an unrecognized active type", () => {
    const filtered = filterDroppablesByActiveType(undefined, containers);

    expect(filtered).toHaveLength(containers.length);
  });
});
