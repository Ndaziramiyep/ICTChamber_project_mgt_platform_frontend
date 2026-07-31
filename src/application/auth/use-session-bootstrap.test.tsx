import { renderHook, waitFor } from "@testing-library/react";

import { useAuthStore } from "@/application/auth/auth-store";
import { useSessionBootstrap } from "@/application/auth/use-session-bootstrap";
import {
  createFakeRepositories,
  createProvidersWrapper,
  resetAuthStore,
} from "@test/support/render-with-providers";

describe("useSessionBootstrap", () => {
  afterEach(resetAuthStore);

  it("is not bootstrapping and leaves the user unset when there are no stored tokens", () => {
    const repositories = createFakeRepositories();
    const { result } = renderHook(() => useSessionBootstrap(), {
      wrapper: createProvidersWrapper(repositories),
    });

    expect(result.current.isBootstrapping).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("restores the user from a valid stored session", async () => {
    const repositories = createFakeRepositories();
    const user = await repositories.authRepository.register({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
      displayName: "Jane Doe",
    });
    const session = await repositories.authRepository.login({
      emailAddress: "jane@example.com",
      plainTextPassword: "at-least-8-characters",
    });
    repositories.tokenStorage.saveTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });

    const { result } = renderHook(() => useSessionBootstrap(), {
      wrapper: createProvidersWrapper(repositories),
    });

    expect(result.current.isBootstrapping).toBe(true);
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it("clears the user when the stored session turns out to be invalid", async () => {
    const repositories = createFakeRepositories();
    repositories.tokenStorage.saveTokens({ accessToken: "dead", refreshToken: "also-dead" });
    useAuthStore.getState().setUser(
      await repositories.authRepository.register({
        emailAddress: "jane@example.com",
        plainTextPassword: "at-least-8-characters",
        displayName: "Jane Doe",
      }),
    );

    const { result } = renderHook(() => useSessionBootstrap(), {
      wrapper: createProvidersWrapper(repositories),
    });

    await waitFor(() => expect(result.current.isBootstrapping).toBe(false));
    expect(useAuthStore.getState().user).toBeNull();
  });
});
