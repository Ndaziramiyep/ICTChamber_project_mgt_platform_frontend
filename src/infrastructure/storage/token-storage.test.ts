import { SessionStorageTokenStorage } from "@/infrastructure/storage/token-storage";

describe("SessionStorageTokenStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns null when nothing has been stored", () => {
    const storage = new SessionStorageTokenStorage();
    expect(storage.getTokens()).toBeNull();
  });

  it("round-trips a saved token pair", () => {
    const storage = new SessionStorageTokenStorage();
    storage.saveTokens({ accessToken: "access-1", refreshToken: "refresh-1" });

    expect(storage.getTokens()).toEqual({ accessToken: "access-1", refreshToken: "refresh-1" });
  });

  it("clears stored tokens", () => {
    const storage = new SessionStorageTokenStorage();
    storage.saveTokens({ accessToken: "access-1", refreshToken: "refresh-1" });
    storage.clearTokens();

    expect(storage.getTokens()).toBeNull();
  });

  it("treats malformed JSON as no stored tokens", () => {
    sessionStorage.setItem("ictchamber.auth.tokens", "{not-json");
    const storage = new SessionStorageTokenStorage();

    expect(storage.getTokens()).toBeNull();
  });

  it("treats a partial token pair as no stored tokens", () => {
    sessionStorage.setItem("ictchamber.auth.tokens", JSON.stringify({ accessToken: "only-one" }));
    const storage = new SessionStorageTokenStorage();

    expect(storage.getTokens()).toBeNull();
  });

  it("does not write anything to localStorage", () => {
    const storage = new SessionStorageTokenStorage();
    storage.saveTokens({ accessToken: "access-1", refreshToken: "refresh-1" });

    expect(localStorage.getItem("ictchamber.auth.tokens")).toBeNull();
  });
});
