// src/lib/auth.ts

// Key names we use in localStorage
const TOKEN_KEY = "access_token";
const USER_KEY = "current_user";

import api from "./api"; // Add this import for refresh call

export interface AuthUser {
  user_id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
  email: string;
  role_id: number;
  role_name: string;
}

// Check if user is authenticated (based on real token presence)
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;

  // Basic expiration check
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // convert to ms
    if (Date.now() >= exp) {
      return false; // Don't logout automatically here, let refresh handle it
    }
    return true;
  } catch (e) {
    logout();
    return false;
  }
}

// Refresh access token using backend endpoint
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await api.get<{ accessToken: string }>("/user/refresh-token");
    if (res.data.accessToken) {
      localStorage.setItem(TOKEN_KEY, res.data.accessToken);
      return true;
    }
    return false;
  } catch (err) {
    console.error("[AUTH] Refresh failed:", err);
    return false;
  }
}

// Save auth data after successful login
export function login(accessToken: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Remove auth data on logout (local only - backend called separately)
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Get current user data
export function getCurrentUser(): AuthUser | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
}

// Helper to get token
export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}