import type { UseFormSetError } from "react-hook-form";

import { ApiError } from "@/domain/errors/api-error";
import { applyServerValidationErrors } from "@/shared/lib/apply-server-validation-errors";

interface FormValues {
  emailAddress: string;
  plainTextPassword: string;
}

describe("applyServerValidationErrors", () => {
  it("returns false and calls nothing for a non-ApiError", () => {
    const setError = jest.fn() as unknown as UseFormSetError<FormValues>;

    const applied = applyServerValidationErrors(new Error("boom"), setError, {
      email_address: "emailAddress",
    });

    expect(applied).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });

  it("returns false for an ApiError with no validation errors", () => {
    const setError = jest.fn() as unknown as UseFormSetError<FormValues>;
    const error = new ApiError({
      httpStatus: 401,
      errorCode: "UnauthorizedError",
      message: "Nope.",
    });

    const applied = applyServerValidationErrors(error, setError, { email_address: "emailAddress" });

    expect(applied).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });

  it("maps an exact wire field path onto its form field", () => {
    const setError = jest.fn() as unknown as UseFormSetError<FormValues>;
    const error = new ApiError({
      httpStatus: 422,
      errorCode: "ValidationError",
      message: "Validation failed.",
      validationErrors: [{ fieldPath: "email_address", message: "Enter a valid email address." }],
    });

    const applied = applyServerValidationErrors(error, setError, {
      email_address: "emailAddress",
      plain_text_password: "plainTextPassword",
    });

    expect(applied).toBe(true);
    expect(setError).toHaveBeenCalledWith("emailAddress", {
      type: "server",
      message: "Enter a valid email address.",
    });
  });

  it("maps a prefixed wire field path (e.g. body.email_address) onto its form field", () => {
    const setError = jest.fn() as unknown as UseFormSetError<FormValues>;
    const error = new ApiError({
      httpStatus: 422,
      errorCode: "ValidationError",
      message: "Validation failed.",
      validationErrors: [
        { fieldPath: "body.email_address", message: "Enter a valid email address." },
      ],
    });

    const applied = applyServerValidationErrors(error, setError, { email_address: "emailAddress" });

    expect(applied).toBe(true);
    expect(setError).toHaveBeenCalledWith("emailAddress", {
      type: "server",
      message: "Enter a valid email address.",
    });
  });

  it("returns false when no error maps to a known field", () => {
    const setError = jest.fn() as unknown as UseFormSetError<FormValues>;
    const error = new ApiError({
      httpStatus: 422,
      errorCode: "ValidationError",
      message: "Validation failed.",
      validationErrors: [{ fieldPath: "some_unmapped_field", message: "Invalid." }],
    });

    const applied = applyServerValidationErrors(error, setError, { email_address: "emailAddress" });

    expect(applied).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });

  it("applies multiple field errors independently", () => {
    const setError = jest.fn() as unknown as UseFormSetError<FormValues>;
    const error = new ApiError({
      httpStatus: 422,
      errorCode: "ValidationError",
      message: "Validation failed.",
      validationErrors: [
        { fieldPath: "email_address", message: "Enter a valid email address." },
        { fieldPath: "plain_text_password", message: "Password must be at least 8 characters." },
      ],
    });

    const applied = applyServerValidationErrors(error, setError, {
      email_address: "emailAddress",
      plain_text_password: "plainTextPassword",
    });

    expect(applied).toBe(true);
    expect(setError).toHaveBeenCalledTimes(2);
  });
});
