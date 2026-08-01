import { arraysEqual } from "@/shared/lib/array-equal";

describe("arraysEqual", () => {
  it("returns true for two empty arrays", () => {
    expect(arraysEqual([], [])).toBe(true);
  });

  it("returns true for identical arrays with the same order", () => {
    expect(arraysEqual(["a", "b", "c"], ["a", "b", "c"])).toBe(true);
  });

  it("returns false when lengths differ", () => {
    expect(arraysEqual(["a", "b"], ["a", "b", "c"])).toBe(false);
  });

  it("returns false when order differs", () => {
    expect(arraysEqual(["a", "b", "c"], ["a", "c", "b"])).toBe(false);
  });

  it("returns false when any value differs", () => {
    expect(arraysEqual(["a", "b"], ["a", "x"])).toBe(false);
  });
});
