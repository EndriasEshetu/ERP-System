import {
  ApiResponse,
  ApiErrorResponse,
  AuthResponseData,
  SessionsResponseData,
  AuthUserDto,
  SessionDto,
  RegisterRequestDto,
  LoginRequestDto,
} from '@erp/shared';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Essential: sends & receives HTTP-only cookies
  });

  const json = (await response.json()) as ApiResponse<T> | ApiErrorResponse;

  if (!response.ok || !json.success) {
    const errorJson = json as ApiErrorResponse;
    const detailMsg = errorJson.errors?.[0]?.message;
    const errorMsg = detailMsg || errorJson.message || `HTTP ${response.status}: Request failed`;
    throw new Error(errorMsg);
  }

  return (json as ApiResponse<T>).data;
}

export const authService = {
  /**
   * Register a new user account and establish session.
   */
  async register(data: RegisterRequestDto): Promise<AuthUserDto> {
    const result = await authFetch<AuthResponseData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.user;
  },

  /**
   * Log in user with credentials and establish session.
   */
  async login(data: LoginRequestDto): Promise<AuthUserDto> {
    const result = await authFetch<AuthResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.user;
  },

  /**
   * Terminate active session and clear cookie on server.
   */
  async logout(): Promise<void> {
    await authFetch<null>('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Fetch current authenticated user profile using active session cookie.
   * Returns null if unauthenticated or session has expired.
   */
  async getCurrentUser(): Promise<AuthUserDto | null> {
    try {
      const result = await authFetch<AuthResponseData>('/auth/me', {
        method: 'GET',
      });
      return result.user;
    } catch {
      return null;
    }
  },

  /**
   * Retrieve active sessions for the authenticated user.
   */
  async getSessions(): Promise<SessionDto[]> {
    const result = await authFetch<SessionsResponseData>('/auth/sessions', {
      method: 'GET',
    });
    return result.sessions;
  },

  /**
   * Revoke an active session by ID.
   */
  async revokeSession(sessionId: string): Promise<void> {
    await authFetch<null>(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },
};
