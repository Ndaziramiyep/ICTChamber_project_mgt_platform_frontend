import { ApiError } from "@/domain/errors/api-error";

describe("ApiError", () => {
  it.each([
    ["isUnauthorized", 401, true],
    ["isForbidden", 403, true],
    ["isNotFound", 404, true],
    ["isConflict", 409, true],
    ["isValidationFailure", 422, true],
  ] as const)("flags %s for status %d", (flag, httpStatus, expected) => {
    const error = new ApiError({ httpStatus, errorCode: "SomeError", message: "boom" });
    expect(error[flag]).toBe(expected);
  });

  it("defaults validationErrors to an empty array when none are provided", () => {
    const error = new ApiError({ httpStatus: 500, errorCode: "ServerError", message: "boom" });
    expect(error.validationErrors).toEqual([]);
  });

  it("preserves provided validation errors", () => {
    const validationErrors = [{ fieldPath: "email_address", message: "invalid email" }];
    const error = new ApiError({
      httpStatus: 422,
      errorCode: "ValidationError",
      message: "invalid",
      validationErrors,
    });
    expect(error.validationErrors).toEqual(validationErrors);
  });

  it("is an instance of Error with the ApiError name", () => {
    const error = new ApiError({ httpStatus: 500, errorCode: "ServerError", message: "boom" });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
  });
});
