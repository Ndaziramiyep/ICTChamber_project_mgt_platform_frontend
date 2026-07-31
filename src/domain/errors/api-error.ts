/** Field-level validation failures, as returned in `error_details.validation_errors`. */
export interface ValidationFieldError {
  fieldPath: string;
  message: string;
}

/**
 * Typed representation of the backend's uniform error envelope
 * (`{ error_code, error_message, error_details }`), normalized from any failed HTTP response.
 */
export class ApiError extends Error {
  readonly httpStatus: number;
  readonly errorCode: string;
  readonly validationErrors: ValidationFieldError[];

  constructor(params: {
    httpStatus: number;
    errorCode: string;
    message: string;
    validationErrors?: ValidationFieldError[];
  }) {
    super(params.message);
    this.name = "ApiError";
    this.httpStatus = params.httpStatus;
    this.errorCode = params.errorCode;
    this.validationErrors = params.validationErrors ?? [];
  }

  get isUnauthorized(): boolean {
    return this.httpStatus === 401;
  }

  get isForbidden(): boolean {
    return this.httpStatus === 403;
  }

  get isNotFound(): boolean {
    return this.httpStatus === 404;
  }

  get isConflict(): boolean {
    return this.httpStatus === 409;
  }

  get isValidationFailure(): boolean {
    return this.httpStatus === 422;
  }
}
