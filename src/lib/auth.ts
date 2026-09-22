// src/lib/auth.ts

// Key names we use in localStorage
const TOKEN_KEY = "access_token";
const USER_KEY = "current_user";

import api from "./api"; // Add this import for refresh call

export interface BranchInfo {
  id: string;
  description: string;
  approval_limit: number;
}

export interface AuthUser {
  user_id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
  email: string;
  role_id: number;
  role_name: string;
  signature?: string;
  phone?: string;
  branch?: BranchInfo | null;
}

export function mapUserResponse(rawUserData: any): AuthUser {
  const userObj = Array.isArray(rawUserData) ? rawUserData[0] : rawUserData;
  let branchData: BranchInfo | null = null;
  if (userObj?.branch && typeof userObj.branch === 'object') {
    branchData = {
      id: String(userObj.branch.id || '000'),
      description: String(userObj.branch.description || 'Head Office (000)'),
      approval_limit: Number(userObj.branch.approval_limit || 0)
    };
  } else if (userObj?.branch_id || userObj?.branch) {
    branchData = {
      id: String(userObj.branch_id || '000'),
      description: String(userObj.branch_name || userObj.branch || 'Head Office (000)'),
      approval_limit: 0
    };
  }
  return {
    ...userObj,
    user_id: Number(userObj.user_id || userObj.id || 0),
    employee_id: String(userObj.employee_id || userObj.employee || ''),
    branch: branchData
  };
}

// Check if user is authenticated (based on real token presence)
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);
  if (!token || !user) return false;

  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000; // convert to ms
      if (Date.now() >= exp) {
        return false; // Token expired
      }
    }
    return true;
  } catch (e) {
    return !!localStorage.getItem(USER_KEY);
  }
}

// Refresh access token using backend endpoint
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await api.get<{ accessToken: string; user?: any }>("/user/refresh-token");
    if (res.data.accessToken) {
      localStorage.setItem(TOKEN_KEY, res.data.accessToken);
      if (res.data.user) {
        setCurrentUser(mapUserResponse(res.data.user));
      }
      return true;
    }
    logout();
    return false;
  } catch (err) {
    // Clear stale tokens if refresh fails
    logout();
    return false;
  }
}

// Save auth data after successful login
export function login(accessToken: string, user: AuthUser, refreshToken?: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (refreshToken) {
    localStorage.setItem("refresh_token", refreshToken);
  }
}

// Save updated user data
export function setCurrentUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Remove auth data on logout (local only - backend called separately)
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("refresh_token");
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