export interface StoredTokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Abstraction over where auth tokens are persisted, so callers never touch `sessionStorage` directly. */
export interface TokenStorage {
  getTokens(): StoredTokenPair | null;
  saveTokens(tokens: StoredTokenPair): void;
  clearTokens(): void;
}

const STORAGE_KEY = "ictchamber.auth.tokens";

/**
 * Persists tokens to `sessionStorage` — not `localStorage` — so a session survives a page
 * reload but never outlives the tab: closing the tab (or opening a new one) clears it, and
 * nothing about the session is ever cached beyond these two opaque tokens. The database (via
 * `GET /auth/me`) remains the sole source of truth for the user's profile.
 */
export class SessionStorageTokenStorage implements TokenStorage {
  getTokens(): StoredTokenPair | null {
    const rawValue = sessionStorage.getItem(STORAGE_KEY);
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
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }

  clearTokens(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
