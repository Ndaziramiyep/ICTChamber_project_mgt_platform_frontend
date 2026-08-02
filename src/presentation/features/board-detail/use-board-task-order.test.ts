import { act, renderHook } from "@testing-library/react";

import type { Task } from "@/domain/entities/task";
import { useBoardTaskOrder } from "@/presentation/features/board-detail/use-board-task-order";

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    taskId: "task-1",
    parentColumnId: "column-a",
    parentBoardId: "board-1",
    title: "Task",
    description: null,
    positionValue: 100,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("useBoardTaskOrder", () => {
  it("seeds each column's order from the server-fetched tasks", () => {
    const tasksByColumnId = {
      a: [
        buildTask({ taskId: "t1", parentColumnId: "a" }),
        buildTask({ taskId: "t2", parentColumnId: "a" }),
      ],
      b: [buildTask({ taskId: "t3", parentColumnId: "b" })],
    };
    const { result } = renderHook(() => useBoardTaskOrder(["a", "b"], tasksByColumnId));

    expect(result.current.orderedTasksByColumnId.a.map((task) => task.taskId)).toEqual([
      "t1",
      "t2",
    ]);
    expect(result.current.orderedTasksByColumnId.b.map((task) => task.taskId)).toEqual(["t3"]);
  });

  it("reorders a task within the same column", () => {
    const tasksByColumnId = {
      a: [buildTask({ taskId: "t1" }), buildTask({ taskId: "t2" }), buildTask({ taskId: "t3" })],
    };
    const { result } = renderHook(() => useBoardTaskOrder(["a"], tasksByColumnId));

    act(() => result.current.moveTask("t1", "a", 2));

    expect(result.current.orderedTasksByColumnId.a.map((task) => task.taskId)).toEqual([
      "t2",
      "t3",
      "t1",
    ]);
  });

  it("moves a task into a different column", () => {
    const tasksByColumnId = {
      a: [buildTask({ taskId: "t1", parentColumnId: "a" })],
      b: [buildTask({ taskId: "t2", parentColumnId: "b" })],
    };
    const { result } = renderHook(() => useBoardTaskOrder(["a", "b"], tasksByColumnId));

    act(() => result.current.moveTask("t1", "b", 0));

    expect(result.current.orderedTasksByColumnId.a).toHaveLength(0);
    expect(result.current.orderedTasksByColumnId.b.map((task) => task.taskId)).toEqual([
      "t1",
      "t2",
    ]);
    expect(result.current.findColumnIdForTask("t1")).toBe("b");
  });

  it("returns the resulting full order so the caller can persist it without waiting on a rerender", () => {
    const tasksByColumnId = {
      a: [buildTask({ taskId: "t1" }), buildTask({ taskId: "t2" }), buildTask({ taskId: "t3" })],
    };
    const { result } = renderHook(() => useBoardTaskOrder(["a"], tasksByColumnId));

    let returnedOrder: Record<string, string[]> = {};
    act(() => {
      returnedOrder = result.current.moveTask("t1", "a", 2);
    });

    expect(returnedOrder.a).toEqual(["t2", "t3", "t1"]);
  });

  it("resetToServerOrder discards local moves and snaps back to server order", () => {
    const tasksByColumnId = {
      a: [buildTask({ taskId: "t1", parentColumnId: "a" })],
      b: [buildTask({ taskId: "t2", parentColumnId: "b" })],
    };
    const { result } = renderHook(() => useBoardTaskOrder(["a", "b"], tasksByColumnId));

    act(() => result.current.moveTask("t1", "b", 0));
    expect(result.current.findColumnIdForTask("t1")).toBe("b");

    act(() => result.current.resetToServerOrder());

    expect(result.current.findColumnIdForTask("t1")).toBe("a");
    expect(result.current.orderedTasksByColumnId.a.map((task) => task.taskId)).toEqual(["t1"]);
    expect(result.current.orderedTasksByColumnId.b.map((task) => task.taskId)).toEqual(["t2"]);
  });

  it("appends a newly created task to its server-reported column", () => {
    const initialTasksByColumnId = { a: [buildTask({ taskId: "t1" })] };
    const { result, rerender } = renderHook(
      ({ tasksByColumnId }) => useBoardTaskOrder(["a"], tasksByColumnId),
      { initialProps: { tasksByColumnId: initialTasksByColumnId } },
    );

    rerender({
      tasksByColumnId: { a: [buildTask({ taskId: "t1" }), buildTask({ taskId: "t2" })] },
    });

    expect(result.current.orderedTasksByColumnId.a.map((task) => task.taskId)).toEqual([
      "t1",
      "t2",
    ]);
  });

  it("drops a task that has been deleted on the server", () => {
    const initialTasksByColumnId = {
      a: [buildTask({ taskId: "t1" }), buildTask({ taskId: "t2" })],
    };
    const { result, rerender } = renderHook(
      ({ tasksByColumnId }) => useBoardTaskOrder(["a"], tasksByColumnId),
      { initialProps: { tasksByColumnId: initialTasksByColumnId } },
    );

    rerender({ tasksByColumnId: { a: [buildTask({ taskId: "t1" })] } });

    expect(result.current.orderedTasksByColumnId.a.map((task) => task.taskId)).toEqual(["t1"]);
  });

  it("does not snap a locally-moved task back to its server column on an unrelated refetch", () => {
    const tasksByColumnIdV1 = {
      a: [buildTask({ taskId: "t1", parentColumnId: "a" })],
      b: [] as Task[],
    };
    const { result, rerender } = renderHook(
      ({ tasksByColumnId }) => useBoardTaskOrder(["a", "b"], tasksByColumnId),
      { initialProps: { tasksByColumnId: tasksByColumnIdV1 } },
    );

    act(() => result.current.moveTask("t1", "b", 0));
    expect(result.current.findColumnIdForTask("t1")).toBe("b");

    // Server still reports t1 under column "a" (the move was never persisted), and a background
    // refetch happens because some other task was created in column "a".
    rerender({
      tasksByColumnId: {
        a: [
          buildTask({ taskId: "t1", parentColumnId: "a" }),
          buildTask({ taskId: "t-new", parentColumnId: "a" }),
        ],
        b: [],
      },
    });

    expect(result.current.findColumnIdForTask("t1")).toBe("b");
    expect(result.current.orderedTasksByColumnId.a.map((task) => task.taskId)).toEqual(["t-new"]);
  });
});
