// Centralized API and Auth Fetch client for CV Studio Cloud

const TOKEN_KEY = 'cv_studio_jwt_token';

let memoryToken: string | null = null;

export function getAuthToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      memoryToken = saved;
      return saved;
    }
  } catch (e) {
    // LocalStorage might be restricted in some iframe modes
  }
  return null;
}

export function setAuthToken(token: string | null): void {
  memoryToken = token;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    // ignore
  }
}

export function clearAuthToken(): void {
  setAuthToken(null);
}

/**
 * Universal wrapper for fetch that automatically injects:
 * 1. Authorization: Bearer <token> header if token is available
 * 2. credentials: 'include' for HttpOnly cookies
 * 3. Default Content-Type header if request body is present
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If body is an object or string and no Content-Type was set
  if (init?.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    try {
      JSON.parse(init.body);
      headers.set('Content-Type', 'application/json');
    } catch {
      // not json string
    }
  }

  const customInit: RequestInit = {
    ...init,
    headers,
    credentials: init?.credentials || 'include',
  };

  return fetch(input, customInit);
}
