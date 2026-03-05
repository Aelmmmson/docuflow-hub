import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Key, Eye, EyeOff, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import axios from "axios";
import { login } from "@/lib/auth"; // ← updated import – uses real auth

// API configuration – relative path (uses Vite proxy)
const api = axios.create({
  baseURL: "/v1/api/dms",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

type LoginResponse = {
  result: string;
  user?: Array<{
    user_id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
    email: string;
    role_id: number;
    role_name: string;
  }>;
  accessToken?: string;
  code: string;
};

// ────────────────────────────────────────────────────────────────
//  Expense-themed decorative background for the right panel
// ────────────────────────────────────────────────────────────────

/** A single mini expense card that floats in the background */
function MiniCard({
  style,
  children,
}: {
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-lg px-3 py-2.5 pointer-events-none select-none"
      style={style}
    >
      {children}
    </div>
  );
}

function ExpenseBackground() {
  // deterministic "random" positions so there is no hydration drift
  const dots = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        top: `${(i * 17 + 5) % 98}%`,
        left: `${(i * 23 + 8) % 97}%`,
        delay: `${(i * 0.4) % 3}s`,
        size: i % 3 === 0 ? "w-1.5 h-1.5" : "w-1 h-1",
        opacity: i % 4 === 0 ? "opacity-20" : "opacity-10",
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">

      {/* ── Glowing blobs ──────────────────────────────────────── */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute bottom-10 -left-16 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-400/5 blur-3xl" />

      {/* ── Dot grid ───────────────────────────────────────────── */}
      {dots.map((d, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-foreground ${d.size} ${d.opacity}`}
          style={{ top: d.top, left: d.left }}
        />
      ))}

      {/* ── Currency symbols ───────────────────────────────────── */}
      {(
        [
          { sym: "$", top: "8%", left: "6%", sz: "text-5xl", op: "opacity-[0.04]", delay: "0s" },
          { sym: "¢", top: "52%", left: "88%", sz: "text-6xl", op: "opacity-[0.04]", delay: "1.2s" },
          { sym: "€", top: "75%", left: "15%", sz: "text-4xl", op: "opacity-[0.035]", delay: "0.6s" },
          { sym: "£", top: "20%", left: "92%", sz: "text-5xl", op: "opacity-[0.035]", delay: "1.8s" },
        ] as const
      ).map(({ sym, top, left, sz, op, delay }) => (
        <span
          key={sym}
          className={`absolute font-bold text-foreground ${sz} ${op} animate-pulse`}
          style={{ top, left, animationDelay: delay, animationDuration: "4s" }}
        >
          {sym}
        </span>
      ))}

      {/* ── Floating mini-cards ────────────────────────────────── */}

      {/* Receipt card — top-right, partially off-screen */}
      <MiniCard
        style={{
          top: "8%",
          right: "-20px",
          transform: "rotate(3deg)",
          animation: "floatCard1 7s ease-in-out infinite",
          opacity: 0,
          animationFillMode: "forwards",
          animationDelay: "0.4s",
        }}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Expense Receipt</p>
        <div className="space-y-2 w-48">
          {[["Office Supplies", "$4,200"], ["Travel Claim", "$12,500"], ["Utilities", "$8,750"], ["Logistics", "$3,800"]].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{k}</span>
              <span className="text-[11px] font-semibold text-foreground">{v}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-border/60 flex justify-between">
            <span className="text-xs font-bold text-foreground">Total</span>
            <span className="text-xs font-bold text-emerald-500">$29,250</span>
          </div>
        </div>
      </MiniCard>

      {/* Bar chart card — upper-left, partially off-screen */}
      <MiniCard
        style={{
          top: "28%",
          left: "-20px",
          transform: "rotate(-2.5deg)",
          animation: "floatCard2 8s ease-in-out infinite",
          opacity: 0,
          animationFillMode: "forwards",
          animationDelay: "1s",
        }}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Weekly Expenses</p>
        <div className="flex items-end gap-1.5 h-16 w-44">
          {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.55].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{
                height: `${h * 100}%`,
                background: `hsl(${210 + i * 15}, 80%, ${55 + i * 3}%)`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i} className="text-[9px] text-muted-foreground flex-1 text-center">{d}</span>
          ))}
        </div>
      </MiniCard>

      {/* Budget donut — lower-right corner, partially off-screen */}
      <MiniCard
        style={{
          bottom: "6%",
          right: "-20px",
          transform: "rotate(2deg)",
          animation: "floatCard3 10s ease-in-out infinite",
          opacity: 0,
          animationFillMode: "forwards",
          animationDelay: "1.8s",
        }}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Monthly Budget</p>
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90 shrink-0">
            <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-muted/30" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3.5"
              strokeDasharray="62 88" strokeLinecap="round" className="text-blue-400" />
          </svg>
          <div>
            <p className="text-2xl font-bold text-foreground leading-tight">68%</p>
            <p className="text-[10px] text-muted-foreground">of monthly cap used</p>
            <p className="text-[10px] font-semibold text-emerald-500 mt-0.5">$32,000 remaining</p>
          </div>
        </div>
      </MiniCard>

      {/* Inline keyframes */}
      <style>{`
        @keyframes floatCard1 {
          0%   { transform: rotate(3deg) translateY(0px);   opacity: 0.44; }
          50%  { transform: rotate(3deg) translateY(-12px); opacity: 0.54; }
          100% { transform: rotate(3deg) translateY(0px);   opacity: 0.44; }
        }
        @keyframes floatCard2 {
          0%   { transform: rotate(-2.5deg) translateY(0px);   opacity: 0.42; }
          50%  { transform: rotate(-2.5deg) translateY(-14px); opacity: 0.52; }
          100% { transform: rotate(-2.5deg) translateY(0px);   opacity: 0.42; }
        }
        @keyframes floatCard3 {
          0%   { transform: rotate(2deg) translateY(0px);   opacity: 0.40; }
          50%  { transform: rotate(2deg) translateY(-10px); opacity: 0.50; }
          100% { transform: rotate(2deg) translateY(0px);   opacity: 0.40; }
        }
      `}</style>
    </div>
  );
}

export default function Login() {

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || "/";
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmed = identifier.trim();

    if (!trimmed) {
      setError("Please enter your email");
      setLoading(false);
      return;
    }

    const payload = {
      email: trimmed,
      password,
    };

    try {
      console.log("[LOGIN] Sending request →", payload);

      const res = await api.post<LoginResponse>("/user/login", payload);

      console.log("[LOGIN] Response status:", res.status);
      console.log("[LOGIN] Response data:", res.data);

      if (res.data.code !== "200") {
        throw new Error(res.data.result || "Login failed");
      }

      const { accessToken, user } = res.data;

      if (!accessToken) {
        throw new Error("No access token received");
      }

      if (!user || user.length === 0) {
        console.warn("[LOGIN] No user data in response");
      }

      // Save real token + user data using the updated auth helper
      login(accessToken, user[0]);

      console.log("[LOGIN] Auth state saved successfully");
      console.log("[LOGIN] Navigating to:", from);

      navigate(from, { replace: true });   // ← now goes to "/" if no from
    } catch (err: unknown) {
      let message = "Something went wrong. Please try again.";

      if (err instanceof Error) {
        message = err.message;
      }

      if (axios.isAxiosError(err)) {
        const axiosErr = err as import("axios").AxiosError;
        const status = axiosErr.response?.status;
        const data = axiosErr.response?.data as { result?: string } | undefined;

        if (status === 401) {
          message = data?.result || "Incorrect email or password";
        } else if (status === 400 || status === 500) {
          message = data?.result || "Server error – please try later";
        } else if (data?.result) {
          message = data.result;
        }
      }

      setError(message);
      console.error("[LOGIN] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left Column - Video & Marketing */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-[40%] flex-col p-12 pl-16 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/xdms.mp4" type="video/mp4" />
            <img
              src="/usg-logo-O.png"
              alt="Fallback background"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-300/90 via-cyan-300/10 to-blue-200/90 backdrop-blur-[0.2px]" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/60 rounded-full backdrop-blur-sm">
              <img src="/usg-logo-O.png" alt="Logo" className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold text-white">Document & Expense - xDMS</span>
          </div>
          <p className="text-white/80 text-lg mt-6 leading-relaxed">
            Securely manage and approve your documents. Sign in with your
            Employee ID or Email to access your personalized dashboard, quick
            templates, and approval workflows.
          </p>
        </div>

        <div className="relative z-10 space-y-8 mt-20">
          <div className="flex items-start gap-4">
            <span className="flex-none mt-1 inline-block w-3 h-3 bg-emerald-300 rounded-full shadow-sm" />
            <div>
              <h3 className="text-white font-semibold">Fast document capture</h3>
              <p className="text-white/70 text-sm">
                Upload or scan documents quickly and classify automatically.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="flex-none mt-1 inline-block w-3 h-3 bg-amber-300 rounded-full shadow-sm" />
            <div>
              <h3 className="text-white font-semibold">Approval workflows</h3>
              <p className="text-white/70 text-sm">
                Route documents to approvers and track status in one place.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="flex-none mt-1 inline-block w-3 h-3 bg-blue-300 rounded-full shadow-sm" />
            <div>
              <h3 className="text-white font-semibold">Secure access controls</h3>
              <p className="text-white/70 text-sm">
                Role-based permissions and activity logs for compliance.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Column - Login Form */}
      <div className="flex-1 lg:w-[60%] flex items-center justify-center p-4 lg:p-6 pt-10 lg:pt-6 relative overflow-hidden">

        {/* ── Expense-themed decorative background ───────────────────────── */}
        <ExpenseBackground />
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ animationDelay: "200ms" }}
          >
            <div className="relative w-full h-80 lg:h-72 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
              {/* Decorative folder elements */}
              <div
                className="work-5 bg-gradient-to-r from-blue-300 to-blue-300 w-full h-full rounded-2xl rounded-tr-none relative 
                after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-32 after:h-4 after:bg-gradient-to-r after:from-blue-300 after:to-blue-300 after:rounded-t-2xl 
                before:absolute before:content-[''] before:-top-[14px] before:right-[123px] before:w-4 before:h-4 before:bg-gradient-to-r before:from-blue-300 before:to-blue-300 before:[clip-path:polygon(100%_35%,100%_100%,50%_100%)]"
              />

              <div className="work-4 absolute inset-1 bg-blue-50 dark:bg-blue-900/30 rounded-2xl" />
              <div className="work-2 absolute inset-1 bg-blue-100 dark:bg-blue-800/40 rounded-2xl" />

              <div
                className="work-1 absolute bottom-0 bg-gradient-to-t from-blue-50 to-white dark:from-blue-950/50 dark:to-card w-full h-[calc(100%-16px)] rounded-2xl rounded-tl-none overflow-hidden
                after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-[80%] after:h-[16px] after:bg-white dark:after:bg-card after:rounded-t-2xl 
                before:absolute before:content-[''] before:-top-[10px] before:left-[calc(80%-12px)] before:size-3 before:bg-white dark:before:bg-card before:[clip-path:polygon(0_14%,50%_100%,0%_100%)]"
              >
                <div className="absolute inset-0 p-6 flex flex-col z-10 justify-center">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-base font-bold text-foreground">Sign In</h2>
                    <span className="text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full inline-flex items-center gap-1 shadow-sm">
                      <Shield className="w-3 h-3 text-blue-700" />
                      <span className="hidden sm:inline">Secure</span>
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    Fill in your Email and password to continue.
                  </p>

                  {error && (
                    <div className="mb-2 font-bold dark:border-red-800 text-red-800 dark:text-red-200 text-xs">
                      {error}
                    </div>
                  )}

                  <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <input
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Email"
                        type="email"
                        autoComplete="email"
                        className="w-full pl-10 pr-3 py-2 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        className="w-full pl-10 pr-10 py-2 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 rounded-md bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${loading ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg active:translate-y-px"
                          }`}
                      >
                        {loading ? "Signing in..." : "Sign In"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground/80 mt-6 italic">
                Powered by <span className="font-semibold">USG®</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}