import { LocalStorageTokenStorage } from "@/infrastructure/storage/token-storage";

describe("LocalStorageTokenStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when nothing has been stored", () => {
    const storage = new LocalStorageTokenStorage();
    expect(storage.getTokens()).toBeNull();
  });

  it("round-trips a saved token pair", () => {
    const storage = new LocalStorageTokenStorage();
    storage.saveTokens({ accessToken: "access-1", refreshToken: "refresh-1" });

    expect(storage.getTokens()).toEqual({ accessToken: "access-1", refreshToken: "refresh-1" });
  });

  it("clears stored tokens", () => {
    const storage = new LocalStorageTokenStorage();
    storage.saveTokens({ accessToken: "access-1", refreshToken: "refresh-1" });
    storage.clearTokens();

    expect(storage.getTokens()).toBeNull();
  });

  it("treats malformed JSON as no stored tokens", () => {
    localStorage.setItem("ictchamber.auth.tokens", "{not-json");
    const storage = new LocalStorageTokenStorage();

    expect(storage.getTokens()).toBeNull();
  });

  it("treats a partial token pair as no stored tokens", () => {
    localStorage.setItem("ictchamber.auth.tokens", JSON.stringify({ accessToken: "only-one" }));
    const storage = new LocalStorageTokenStorage();

    expect(storage.getTokens()).toBeNull();
  });
});
