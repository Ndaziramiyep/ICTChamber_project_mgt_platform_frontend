import { ApiError } from "@/domain/errors/api-error";
import { createApiClient } from "@/infrastructure/http/api-client";
import { HttpAuthRepository } from "@/infrastructure/repositories/http-auth-repository";
import { SessionStorageTokenStorage } from "@/infrastructure/storage/token-storage";
import { registerMockServerLifecycleHooks } from "@test/mocks/server";

registerMockServerLifecycleHooks();

function buildRepository() {
  const tokenStorage = new SessionStorageTokenStorage();
  const onSessionExpired = jest.fn();
  const httpClient = createApiClient({ tokenStorage, onSessionExpired });
  return { repository: new HttpAuthRepository(httpClient), tokenStorage, onSessionExpired };
}

describe("HttpAuthRepository", () => {
  beforeEach(() => sessionStorage.clear());

  it("registers a new user", async () => {
    const { repository } = buildRepository();

    const user = await repository.register({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
      displayName: "Jane Doe",
    });

    expect(user).toMatchObject({
      emailAddress: "jane@example.com",
      displayName: "Jane Doe",
      isAccountActive: true,
    });
    expect(user.userId).toEqual(expect.any(String));
  });

  it("rejects registering the same email twice with a 409 ApiError", async () => {
    const { repository } = buildRepository();
    await repository.register({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
      displayName: "Jane Doe",
    });

    await expect(
      repository.register({
        emailAddress: "jane@example.com",
        plainTextPassword: "another-password",
        displayName: "Jane Doe Again",
      }),
    ).rejects.toMatchObject({ httpStatus: 409, errorCode: "EmailAlreadyRegisteredError" });
  });

  it("logs in and returns the session with the current user profile", async () => {
    const { repository } = buildRepository();
    await repository.register({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
      displayName: "Jane Doe",
    });

    const session = await repository.login({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
    });

    expect(session.accessToken).toEqual(expect.any(String));
    expect(session.refreshToken).toEqual(expect.any(String));
    expect(session.user.emailAddress).toBe("jane@example.com");
  });

  it("throws a 401 ApiError on bad login credentials", async () => {
    const { repository } = buildRepository();

    await expect(
      repository.login({ emailAddress: "nobody@example.com", plainTextPassword: "wrong-password" }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("exchanges a refresh token for a new access token", async () => {
    const { repository } = buildRepository();
    await repository.register({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
      displayName: "Jane Doe",
    });
    const session = await repository.login({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
    });

    const newAccessToken = await repository.refreshAccessToken(session.refreshToken);

    expect(newAccessToken).toEqual(expect.any(String));
    expect(newAccessToken).not.toBe(session.accessToken);
  });

  it("fetches the current user when authenticated", async () => {
    const { repository, tokenStorage } = buildRepository();
    await repository.register({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
      displayName: "Jane Doe",
    });
    const session = await repository.login({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
    });
    tokenStorage.saveTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });

    const currentUser = await repository.getCurrentUser();

    expect(currentUser.emailAddress).toBe("jane@example.com");
  });
});
