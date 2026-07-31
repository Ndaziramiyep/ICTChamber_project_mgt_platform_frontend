export interface StoredTokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Abstraction over where auth tokens are persisted, so callers never touch `localStorage` directly. */
export interface TokenStorage {
  getTokens(): StoredTokenPair | null;
  saveTokens(tokens: StoredTokenPair): void;
  clearTokens(): void;
}

const STORAGE_KEY = "ictchamber.auth.tokens";

/** Persists tokens to `localStorage` so a session survives page reloads. */
export class LocalStorageTokenStorage implements TokenStorage {
  getTokens(): StoredTokenPair | null {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as StoredTokenPair;
      if (!parsedValue.accessToken || !parsedValue.refreshToken) {
        return null;
      }
      return parsedValue;
    } catch {
      return null;
    }
  }

  saveTokens(tokens: StoredTokenPair): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }

  clearTokens(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
