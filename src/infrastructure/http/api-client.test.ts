import { ApiError } from "@/domain/errors/api-error";
import { createApiClient } from "@/infrastructure/http/api-client";
import { SessionStorageTokenStorage } from "@/infrastructure/storage/token-storage";
import { registerMockServerLifecycleHooks } from "@test/mocks/server";

registerMockServerLifecycleHooks();

describe("createApiClient", () => {
  beforeEach(() => sessionStorage.clear());

  it("attaches the stored access token to outgoing requests", async () => {
    const tokenStorage = new SessionStorageTokenStorage();
    const client = createApiClient({ tokenStorage, onSessionExpired: jest.fn() });

    await client.post("/api/v1/auth/register", {
      email_address: "jane@example.com",
      plain_text_password: "at-least-8-characters",
      display_name: "Jane Doe",
    });
    const login = await client.post("/api/v1/auth/login", {
      email_address: "jane@example.com",
      plain_text_password: "at-least-8-characters",
    });
    tokenStorage.saveTokens({
      accessToken: login.data.access_token_value,
      refreshToken: login.data.refresh_token_value,
    });

    const meResponse = await client.get("/api/v1/auth/me");
    expect(meResponse.data.email_address).toBe("jane@example.com");
  });

  it("transparently refreshes an expired access token and retries the original request once", async () => {
    const tokenStorage = new SessionStorageTokenStorage();
    const onSessionExpired = jest.fn();
    const client = createApiClient({ tokenStorage, onSessionExpired });

    await client.post("/api/v1/auth/register", {
      email_address: "jane@example.com",
      plain_text_password: "at-least-8-characters",
      display_name: "Jane Doe",
    });
    const login = await client.post("/api/v1/auth/login", {
      email_address: "jane@example.com",
      plain_text_password: "at-least-8-characters",
    });

    // Simulate an expired access token: a garbage access token paired with the real refresh
    // token, exactly the state a client is in right after its 15-minute access token lapses.
    tokenStorage.saveTokens({
      accessToken: "expired-token",
      refreshToken: login.data.refresh_token_value,
    });

    const meResponse = await client.get("/api/v1/auth/me");

    expect(meResponse.data.email_address).toBe("jane@example.com");
    expect(tokenStorage.getTokens()?.accessToken).not.toBe("expired-token");
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it("clears tokens and reports session expiry when the refresh token itself is invalid", async () => {
    const tokenStorage = new SessionStorageTokenStorage();
    const onSessionExpired = jest.fn();
    const client = createApiClient({ tokenStorage, onSessionExpired });

    tokenStorage.saveTokens({ accessToken: "expired-token", refreshToken: "also-invalid" });

    await expect(client.get("/api/v1/auth/me")).rejects.toBeInstanceOf(ApiError);

    expect(tokenStorage.getTokens()).toBeNull();
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it("reports session expiry without attempting a refresh when there are no stored tokens", async () => {
    const tokenStorage = new SessionStorageTokenStorage();
    const onSessionExpired = jest.fn();
    const client = createApiClient({ tokenStorage, onSessionExpired });

    await expect(client.get("/api/v1/auth/me")).rejects.toMatchObject({ httpStatus: 401 });
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it("normalizes a 409 conflict response into an ApiError with the backend's error code and message", async () => {
    const tokenStorage = new SessionStorageTokenStorage();
    const client = createApiClient({ tokenStorage, onSessionExpired: jest.fn() });

    const registrationPayload = {
      email_address: "jane@example.com",
      plain_text_password: "at-least-8-characters",
      display_name: "Jane Doe",
    };
    await client.post("/api/v1/auth/register", registrationPayload);

    await expect(client.post("/api/v1/auth/register", registrationPayload)).rejects.toMatchObject({
      httpStatus: 409,
      errorCode: "EmailAlreadyRegisteredError",
      message: "This email is already registered.",
    });
  });
});
