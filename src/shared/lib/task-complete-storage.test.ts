import { readIsTaskComplete, writeIsTaskComplete } from "@/shared/lib/task-complete-storage";

describe("task-complete-storage", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("reports a task as incomplete when nothing has been stored for it", () => {
    expect(readIsTaskComplete("task-1")).toBe(false);
  });

  it("remembers a task marked complete", () => {
    writeIsTaskComplete("task-1", true);
    expect(readIsTaskComplete("task-1")).toBe(true);
  });

  it("forgets a task marked back to incomplete", () => {
    writeIsTaskComplete("task-1", true);
    writeIsTaskComplete("task-1", false);
    expect(readIsTaskComplete("task-1")).toBe(false);
  });

  it("tracks each task independently", () => {
    writeIsTaskComplete("task-1", true);
    expect(readIsTaskComplete("task-2")).toBe(false);
  });
});
