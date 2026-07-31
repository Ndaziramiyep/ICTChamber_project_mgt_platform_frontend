import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { ApiError, type ValidationFieldError } from "@/domain/errors/api-error";
import type { ErrorEnvelope } from "@/infrastructure/http/error-envelope";
import type { TokenStorage } from "@/infrastructure/storage/token-storage";
import { environmentConfig } from "@/shared/config/env";

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _hasRetriedAfterRefresh?: boolean;
}

export interface CreateApiClientOptions {
  tokenStorage: TokenStorage;
  /** Invoked once the refresh token is confirmed dead so the caller can force a re-login. */
  onSessionExpired: () => void;
}

function mapValidationErrors(envelope: ErrorEnvelope | undefined): ValidationFieldError[] {
  const rawEntries = envelope?.error_details?.validation_errors ?? [];
  return rawEntries.map((entry) => ({
    fieldPath: entry.field_path ?? entry.loc?.join(".") ?? "",
    message: entry.message ?? entry.msg ?? "Invalid value.",
  }));
}

function toApiError(error: AxiosError<ErrorEnvelope>): ApiError {
  const envelope = error.response?.data;
  return new ApiError({
    httpStatus: error.response?.status ?? 0,
    errorCode: envelope?.error_code ?? "NetworkError",
    message: envelope?.error_message ?? error.message ?? "An unexpected error occurred.",
    validationErrors: mapValidationErrors(envelope),
  });
}

/**
 * Creates the axios instance used by every HTTP repository. Attaches the stored access token to
 * every request and, on a 401, attempts a single `/auth/refresh` + retry before giving up and
 * calling `onSessionExpired`.
 */
export function createApiClient({
  tokenStorage,
  onSessionExpired,
}: CreateApiClientOptions): AxiosInstance {
  const client = axios.create({ baseURL: environmentConfig.apiBaseUrl });

  let inFlightRefresh: Promise<string> | null = null;

  async function performTokenRefresh(refreshToken: string): Promise<string> {
    const response = await axios.post<{ access_token_value: string }>(
      `${environmentConfig.apiBaseUrl}/api/v1/auth/refresh`,
      { refresh_token_value: refreshToken },
    );
    return response.data.access_token_value;
  }

  client.interceptors.request.use((config) => {
    const tokens = tokenStorage.getTokens();
    if (tokens?.accessToken) {
      config.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ErrorEnvelope>) => {
      const originalRequest = error.config as RetriableRequestConfig | undefined;
      const isUnauthorized = error.response?.status === 401;
      const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh") ?? false;
      const storedTokens = tokenStorage.getTokens();

      const canAttemptRefresh =
        isUnauthorized &&
        !isRefreshRequest &&
        !originalRequest?._hasRetriedAfterRefresh &&
        originalRequest !== undefined &&
        storedTokens !== null;

      if (canAttemptRefresh) {
        originalRequest._hasRetriedAfterRefresh = true;
        try {
          inFlightRefresh ??= performTokenRefresh(storedTokens.refreshToken);
          const newAccessToken = await inFlightRefresh;
          inFlightRefresh = null;
          tokenStorage.saveTokens({
            accessToken: newAccessToken,
            refreshToken: storedTokens.refreshToken,
          });

          originalRequest.headers = originalRequest.headers ?? new AxiosHeaders();
          originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
          return await client(originalRequest);
        } catch {
          inFlightRefresh = null;
          tokenStorage.clearTokens();
          onSessionExpired();
          return Promise.reject(toApiError(error));
        }
      }

      if (isUnauthorized && (isRefreshRequest || storedTokens === null)) {
        tokenStorage.clearTokens();
        onSessionExpired();
      }

      return Promise.reject(toApiError(error));
    },
  );

  return client;
}
