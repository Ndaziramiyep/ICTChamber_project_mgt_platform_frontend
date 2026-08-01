import type { Task } from "@/domain/entities/task";
import { taskMatchesSearch } from "@/presentation/features/board-detail/task-search";

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    taskId: "task-1",
    parentColumnId: "column-1",
    parentBoardId: "board-1",
    title: "Wire up login form",
    description: "Use the /auth/login endpoint",
    positionValue: 100,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("taskMatchesSearch", () => {
  it("matches everything when the query is empty", () => {
    expect(taskMatchesSearch(buildTask(), "")).toBe(true);
    expect(taskMatchesSearch(buildTask(), "   ")).toBe(true);
  });

  it("matches on title, case-insensitively", () => {
    expect(taskMatchesSearch(buildTask(), "LOGIN")).toBe(true);
  });

  it("matches on description, case-insensitively", () => {
    expect(taskMatchesSearch(buildTask(), "endpoint")).toBe(true);
  });

  it("handles a null description without throwing", () => {
    expect(taskMatchesSearch(buildTask({ description: null }), "endpoint")).toBe(false);
  });

  it("returns false when nothing matches", () => {
    expect(taskMatchesSearch(buildTask(), "nonexistent")).toBe(false);
  });
});
