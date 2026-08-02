import { cloneElement, isValidElement, useId, type ReactElement } from "react";

export interface FormFieldProps {
  label: string;
  errorMessage?: string;
  hint?: string;
  children: ReactElement<{ id?: string; hasError?: boolean; "aria-describedby"?: string }>;
}

/**
 * Associates a label, an optional hint/error message, and a single form control (Input/TextArea)
 * with the correct `id`/`aria-describedby` wiring, so every form gets this for free.
 */
export function FormField({ label, errorMessage, hint, children }: FormFieldProps) {
  const generatedId = useId();
  const fieldId = children.props.id ?? generatedId;
  const descriptionId = errorMessage ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: fieldId,
        hasError: Boolean(errorMessage),
        "aria-describedby": descriptionId,
      })
    : children;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {label}
      </label>
      {control}
      {errorMessage ? (
        <p id={descriptionId} role="alert" className="text-sm text-error">
          {errorMessage}
        </p>
      ) : hint ? (
        <p id={descriptionId} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
