import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError } from "@/domain/errors/api-error";

/**
 * Maps a 422 response's `error_details.validation_errors` onto react-hook-form fields, so the
 * backend's field-level message shows up next to the relevant input instead of only in a toast.
 * `wireFieldToFormField` keys are matched against the end of each error's `fieldPath` (e.g.
 * `"board_title"` matches both `"board_title"` and `"body.board_title"`), since the exact prefix
 * the backend sends isn't guaranteed. Returns true if at least one error was applied, so the
 * caller can skip the generic toast when every error was placed on a field.
 */
export function applyServerValidationErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  wireFieldToFormField: Partial<Record<string, Path<TFieldValues>>>,
): boolean {
  if (!(error instanceof ApiError) || error.validationErrors.length === 0) {
    return false;
  }

  let appliedToAnyField = false;
  for (const validationError of error.validationErrors) {
    const formField = Object.entries(wireFieldToFormField).find(
      ([wireField]) =>
        validationError.fieldPath === wireField ||
        validationError.fieldPath.endsWith(`.${wireField}`),
    )?.[1];
    if (formField) {
      setError(formField, { type: "server", message: validationError.message });
      appliedToAnyField = true;
    }
  }
  return appliedToAnyField;
}
