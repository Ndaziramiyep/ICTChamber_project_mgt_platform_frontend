/** Wire shape of the backend's uniform error response body. */
export interface ErrorEnvelope {
  error_code: string;
  error_message: string;
  error_details?: {
    validation_errors?: Array<{
      field_path?: string;
      loc?: Array<string | number>;
      message?: string;
      msg?: string;
    }>;
  } | null;
}
