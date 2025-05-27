import { User, AuthResponse } from '@./api-interfaces';

/**
 * Authentication utilities for both frontend and backend
 */

// Token storage key
// amazonq-ignore-next-line
export const AUTH_TOKEN_KEY = 'auth_token';

// Token utilities
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

// Auth state management
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Parse JWT token (simple version)
export const parseToken = (token: string): { userId: string; exp: number } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  const decoded = parseToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

// Handle authentication response
export const handleAuthResponse = (response: AuthResponse): User => {
  setToken(response.token);
  return response.user;
};

// Logout utility
export const logout = (): void => {
  removeToken();
};
