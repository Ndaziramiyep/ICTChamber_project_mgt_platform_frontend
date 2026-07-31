import { buildFakeUser } from "@test/support/fake-repositories";

import { useAuthStore } from "@/application/auth/auth-store";

describe("useAuthStore", () => {
  afterEach(() => {
    useAuthStore.setState({ user: null });
  });

  it("starts with no user", () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("stores the user set via setUser", () => {
    const user = buildFakeUser();
    useAuthStore.getState().setUser(user);

    expect(useAuthStore.getState().user).toEqual(user);
  });

  it("clears the user when set to null", () => {
    useAuthStore.getState().setUser(buildFakeUser());
    useAuthStore.getState().setUser(null);

    expect(useAuthStore.getState().user).toBeNull();
  });
});
