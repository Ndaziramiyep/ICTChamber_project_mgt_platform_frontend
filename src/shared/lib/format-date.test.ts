import { formatDate } from "@/shared/lib/format-date";

describe("formatDate", () => {
  it("formats an ISO timestamp as a medium-length date", () => {
    expect(formatDate("2026-07-31T10:15:00Z")).toBe("Jul 31, 2026");
  });
});
