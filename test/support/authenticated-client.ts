import type { AxiosInstance } from "axios";

import { createApiClient } from "@/infrastructure/http/api-client";
import { LocalStorageTokenStorage } from "@/infrastructure/storage/token-storage";

let registrationCounter = 0;

/**
 * Registers and logs in a fresh user against the MSW mock backend, returning an axios instance
 * with valid tokens already attached — the setup every authenticated repository test needs.
 */
export async function createAuthenticatedHttpClient(): Promise<AxiosInstance> {
  registrationCounter += 1;
  const emailAddress = `user-${registrationCounter}@example.com`;
  const tokenStorage = new LocalStorageTokenStorage();
  const httpClient = createApiClient({ tokenStorage, onSessionExpired: jest.fn() });

  await httpClient.post("/api/v1/auth/register", {
    email_address: emailAddress,
    plain_text_password: "at-least-8-characters",
    display_name: "Test User",
  });
  const loginResponse = await httpClient.post("/api/v1/auth/login", {
    email_address: emailAddress,
    plain_text_password: "at-least-8-characters",
  });
  tokenStorage.saveTokens({
    accessToken: loginResponse.data.access_token_value,
    refreshToken: loginResponse.data.refresh_token_value,
  });

  return httpClient;
}
