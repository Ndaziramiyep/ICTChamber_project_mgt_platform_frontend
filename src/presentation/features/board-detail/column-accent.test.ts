import { getColumnAccent } from "@/presentation/features/board-detail/column-accent";

describe("getColumnAccent", () => {
  it("returns a distinct accent for each of the first several columns", () => {
    const accents = [0, 1, 2, 3].map(getColumnAccent);
    const uniqueHeaders = new Set(accents.map((accent) => accent.header));

    expect(uniqueHeaders.size).toBe(4);
  });

  it("cycles back to the first accent once the palette is exhausted", () => {
    const first = getColumnAccent(0);
    const wrapped = getColumnAccent(8);

    expect(wrapped).toEqual(first);
  });

  it("pairs every accent with a header text color", () => {
    for (let index = 0; index < 8; index += 1) {
      const accent = getColumnAccent(index);
      expect(accent.header).toMatch(/^bg-/);
      expect(accent.headerText).toMatch(/^text-/);
    }
  });
});
