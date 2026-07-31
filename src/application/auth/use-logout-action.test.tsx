import { renderHook, act } from "@testing-library/react";

import { useAuthStore } from "@/application/auth/auth-store";
import { useLogoutAction } from "@/application/auth/use-logout-action";
import { buildFakeUser } from "@test/support/fake-repositories";
import {
  createFakeRepositories,
  createProvidersWrapper,
  resetAuthStore,
} from "@test/support/render-with-providers";

describe("useLogoutAction", () => {
  afterEach(resetAuthStore);

  it("clears stored tokens and the auth store user", () => {
    const repositories = createFakeRepositories();
    repositories.tokenStorage.saveTokens({ accessToken: "a", refreshToken: "b" });
    useAuthStore.getState().setUser(buildFakeUser());

    const { result } = renderHook(() => useLogoutAction(), {
      wrapper: createProvidersWrapper(repositories),
    });

    act(() => result.current());

    expect(repositories.tokenStorage.getTokens()).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
