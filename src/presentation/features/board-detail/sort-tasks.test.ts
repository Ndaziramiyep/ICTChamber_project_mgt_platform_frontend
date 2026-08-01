import type { Task } from "@/domain/entities/task";
import { sortTasks } from "@/presentation/features/board-detail/sort-tasks";

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    taskId: "task-1",
    parentColumnId: "column-1",
    parentBoardId: "board-1",
    title: "Task",
    description: null,
    positionValue: 100,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("sortTasks", () => {
  const tasks = [
    buildTask({
      taskId: "b",
      title: "Banana",
      createdAt: "2026-01-02T00:00:00Z",
      updatedAt: "2026-01-05T00:00:00Z",
    }),
    buildTask({
      taskId: "a",
      title: "Apple",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-03T00:00:00Z",
    }),
    buildTask({
      taskId: "c",
      title: "Cherry",
      createdAt: "2026-01-03T00:00:00Z",
      updatedAt: "2026-01-04T00:00:00Z",
    }),
  ];

  it("returns the list untouched for manual mode", () => {
    expect(sortTasks(tasks, "manual").map((task) => task.taskId)).toEqual(["b", "a", "c"]);
  });

  it("sorts by title ascending", () => {
    expect(sortTasks(tasks, "title-asc").map((task) => task.taskId)).toEqual(["a", "b", "c"]);
  });

  it("sorts by title descending", () => {
    expect(sortTasks(tasks, "title-desc").map((task) => task.taskId)).toEqual(["c", "b", "a"]);
  });

  it("sorts by creation date, newest first", () => {
    expect(sortTasks(tasks, "created-newest").map((task) => task.taskId)).toEqual(["c", "b", "a"]);
  });

  it("sorts by creation date, oldest first", () => {
    expect(sortTasks(tasks, "created-oldest").map((task) => task.taskId)).toEqual(["a", "b", "c"]);
  });

  it("sorts by last-updated, most recent first", () => {
    expect(sortTasks(tasks, "updated-newest").map((task) => task.taskId)).toEqual(["b", "c", "a"]);
  });

  it("sorts by last-updated, least recent first", () => {
    expect(sortTasks(tasks, "updated-oldest").map((task) => task.taskId)).toEqual(["a", "c", "b"]);
  });

  it("does not mutate the input array", () => {
    const original = [...tasks];
    sortTasks(tasks, "title-asc");
    expect(tasks).toEqual(original);
  });
});
