// src/lib/xauth.ts
import axios from "axios";
import api from "./api";
import { AuthUser } from "./auth";

export const STAFF360_HOST =
  import.meta.env.VITE_STAFF360_HOST || "http://10.203.14.15:8080";
export const XAUTH_APP_KEY = import.meta.env.VITE_XAUTH_APP_KEY || "";
export const XAUTH_APP_SECRET = import.meta.env.VITE_XAUTH_APP_SECRET || "";

export interface XAuthDecodedUser {
  username: string;
  staffId: string;
  fullName: string;
  email: string;
  appName?: string;
  timestamp?: string;
}

export interface XAuthDecodeResponse {
  success: boolean;
  data?: XAuthDecodedUser;
  message?: string;
}

export interface XAuthLoginResult {
  success: boolean;
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  errorType?: "UNREGISTERED" | "DECODE_FAILED" | "SERVER_ERROR";
  message?: string;
}

/**
 * Returns the initiate URL for XAuth login.
 */
export function getXAuthInitiateUrl(): string {
  const appKey = XAUTH_APP_KEY;
  const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/xauth/callback` : "";
  return `${STAFF360_HOST}/api/v1/xauth/signin/initiate?app_key=${encodeURIComponent(
    appKey
  )}${redirectUri ? `&redirect_uri=${encodeURIComponent(redirectUri)}` : ""}`;
}

/**
 * Decodes an opaque XAuth token using the Staff360 decode endpoint.
 */
export async function decodeXAuthToken(
  token: string
): Promise<XAuthDecodedUser> {
  // Use Vite proxy endpoint /api/v1/xauth/decode or direct STAFF360_HOST
  const decodeUrl = `${STAFF360_HOST}/api/v1/xauth/decode`;

  const payload = {
    token,
    appKey: XAUTH_APP_KEY,
    appSecret: XAUTH_APP_SECRET,
  };

  try {
    const response = await axios.post<XAuthDecodeResponse>(decodeUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "Failed to decode XAuth token.");
  } catch (err: any) {
    console.error("[XAUTH] Token decode error:", err);
    throw new Error(
      err.response?.data?.message || err.message || "Invalid or expired XAuth token."
    );
  }
}

/**
 * Authenticates the decoded XAuth user with the DocuFlow Hub backend.
 * Checks if staffId exists in local users table (as employee_id).
 */
export async function authenticateXAuthUser(
  token: string
): Promise<XAuthLoginResult> {
  try {
    // 1. Decode token from XAuth server
    const decoded = await decodeXAuthToken(token);
    console.log("[XAUTH] Decoded user identity:", decoded);

    if (!decoded || (!decoded.staffId && !decoded.username && !decoded.email)) {
      return {
        success: false,
        errorType: "DECODE_FAILED",
        message: "Invalid user data received from XAuth.",
      };
    }

    // 2. Call backend xauth-login endpoint
    try {
      const res = await api.post<{
        code: string;
        result?: string;
        accessToken?: string;
        refreshToken?: string;
        user?: AuthUser[];
      }>("/user/xauth-login", {
        token,
        staffId: decoded.staffId || decoded.username,
        email: decoded.email,
        username: decoded.username,
        fullName: decoded.fullName,
      });

      if (res.data.code === "200" && res.data.accessToken && res.data.user?.[0]) {
        return {
          success: true,
          user: res.data.user[0],
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        };
      } else if (res.data.code === "404" || res.data.result?.includes("not found")) {
        return {
          success: false,
          errorType: "UNREGISTERED",
          message:
            "Your X100 account is not registered in DocuFlow. Please see the team in charge to sign you up unto the system.",
        };
      }
    } catch (backendErr: any) {
      // Fallback: If backend returns 404 for unregistered staffId
      const status = backendErr.response?.status;
      const data = backendErr.response?.data;

      if (status === 404 || data?.code === "404") {
        return {
          success: false,
          errorType: "UNREGISTERED",
          message:
            "Your X100 account is not registered in DocuFlow. Please see the team in charge to sign you up unto the system.",
        };
      }

      // Fallback verification call against /user/verify-staff or /users search if xauth-login route is alias
      try {
        const verifyRes = await api.get<{
          user?: AuthUser;
          users?: AuthUser[];
        }>(`/user/by-employee/${encodeURIComponent(decoded.staffId)}`);

        const matchedUser = verifyRes.data.user || verifyRes.data.users?.[0];
        if (matchedUser) {
          // Mock/Generate access token if verified
          const mockToken = "xauth_" + btoa(JSON.stringify({ staffId: decoded.staffId, exp: Math.floor(Date.now() / 1000) + 86400 }));
          return {
            success: true,
            user: matchedUser,
            accessToken: mockToken,
          };
        }
      } catch (e) {
        console.warn("[XAUTH] Employee verify endpoint not available:", e);
      }

      // If backend is returning explicit 401/404 or missing staffId in DB
      return {
        success: false,
        errorType: "UNREGISTERED",
        message:
          "Your X100 account is not registered in DocuFlow. Please see the team in charge to sign you up unto the system.",
      };
    }

    return {
      success: false,
      errorType: "UNREGISTERED",
      message:
        "Your X100 account is not registered in DocuFlow. Please see the team in charge to sign you up unto the system.",
    };
  } catch (err: any) {
    console.error("[XAUTH] Authentication error:", err);
    return {
      success: false,
      errorType: "DECODE_FAILED",
      message: err.message || "XAuth authentication failed.",
    };
  }
}
