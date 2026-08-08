import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, ShieldAlert, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { authenticateXAuthUser, XAuthLoginResult } from "@/lib/xauth";
import { login } from "@/lib/auth";

export default function XAuthCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [result, setResult] = useState<XAuthLoginResult | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setResult({
        success: false,
        errorType: "DECODE_FAILED",
        message: "No authentication token was received from XAuth.",
      });
      return;
    }

    let isMounted = true;

    async function handleAuth() {
      try {
        const authResult = await authenticateXAuthUser(token!);

        if (!isMounted) return;

        setResult(authResult);

        if (authResult.success && authResult.accessToken && authResult.user) {
          setStatus("success");

          // Save auth token to localStorage (shared origin)
          login(authResult.accessToken, authResult.user, authResult.refreshToken);

          // Post message back to parent window (Login.tsx)
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
              {
                type: "XAUTH_SUCCESS",
                accessToken: authResult.accessToken,
                refreshToken: authResult.refreshToken,
                user: authResult.user,
              },
              "*"
            );
          }

          // Auto-close popup window after 1.5s
          setTimeout(() => {
            window.close();
          }, 1500);
        } else {
          setStatus("error");

          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
              {
                type: "XAUTH_ERROR",
                message: authResult.message,
                errorType: authResult.errorType,
              },
              "*"
            );
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("error");
        setResult({
          success: false,
          errorType: "SERVER_ERROR",
          message: err.message || "An unexpected error occurred during authentication.",
        });
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center relative z-10"
      >
        {status === "loading" && (
          <div className="space-y-6 py-6">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Authenticating with X100</h2>
              <p className="text-sm text-slate-400">
                Verifying your credentials and completing sign in...
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Sign In Successful</h2>
              <p className="text-sm text-emerald-300 font-medium mb-1">
                Welcome back, {result?.user?.first_name || result?.user?.email || "User"}!
              </p>
              <p className="text-xs text-slate-400 mt-3">
                Returning you to DocuFlow Hub. This window will close automatically...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 py-2">
            {result?.errorType === "UNREGISTERED" ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10"
              >
                <ShieldAlert className="w-10 h-10" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10"
              >
                <XCircle className="w-10 h-10" />
              </motion.div>
            )}

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                {result?.errorType === "UNREGISTERED"
                  ? "Account Not Registered"
                  : "Authentication Failed"}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
                {result?.message ||
                  "Unable to authenticate with X100. Please try again or contact support."}
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all shadow-md active:scale-95 text-sm"
            >
              Close Window
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
