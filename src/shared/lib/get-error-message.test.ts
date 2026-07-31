import { ApiError } from "@/domain/errors/api-error";
import { getErrorMessage } from "@/shared/lib/get-error-message";

describe("getErrorMessage", () => {
  it("returns the ApiError message", () => {
    const error = new ApiError({
      httpStatus: 409,
      errorCode: "ConflictError",
      message: "Already exists.",
    });
    expect(getErrorMessage(error)).toBe("Already exists.");
  });

  it("returns a plain Error's message", () => {
    expect(getErrorMessage(new Error("Network down"))).toBe("Network down");
  });

  it("falls back to the default message for unknown thrown values", () => {
    expect(getErrorMessage("a string was thrown")).toBe("Something went wrong. Please try again.");
  });

  it("accepts a custom fallback message", () => {
    expect(getErrorMessage(undefined, "Custom fallback.")).toBe("Custom fallback.");
  });
});
