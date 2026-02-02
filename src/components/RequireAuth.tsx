// src/components/RequireAuth.tsx
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, refreshAccessToken } from "@/lib/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    async function checkAndRefreshAuth() {
      let authenticated = isAuthenticated();
      if (!authenticated && localStorage.getItem("access_token")) { // Token exists but expired
        const refreshed = await refreshAccessToken();
        authenticated = refreshed && isAuthenticated(); // Re-check after refresh
      }
      setAuthStatus(authenticated ? "authenticated" : "unauthenticated");
    }
    checkAndRefreshAuth();
  }, []);

  if (authStatus === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Simple loading state
  }

  if (authStatus === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default RequireAuth;