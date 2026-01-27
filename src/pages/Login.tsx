import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "@/lib/auth";
import { User, Key, Eye, EyeOff, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  type LocationState = { from?: { pathname?: string } } | null;
  const from = (location.state as LocationState)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // simulate auth
    setTimeout(() => {
      login(identifier || "user");
      setLoading(false);
      navigate(from, { replace: true });
    }, 700);
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left Column - Video Background (40% width) */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-[40%] flex-col p-12 pl-16 relative overflow-hidden"
      >
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/xdms.mp4" type="video/mp4" />
            {/* Fallback image if video doesn't load */}
            <img 
              src="/usg-logo-O.png" 
              alt="Fallback background" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </video>
          
          {/* Gradient Overlay - Using original colors with transparency */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/70 via-emerald-500/65 to-teal-500/70 backdrop-blur-[0.2px]" />
          
          {/* Additional dark overlay for better contrast */}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Background blur effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>

        {/* Top content */}
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

        {/* Features list */}
        <div className="relative z-10 space-y-8 mt-20">
          <div className="flex items-start gap-4">
            <span className="flex-none mt-1 inline-block w-3 h-3 bg-emerald-300 rounded-full shadow-sm" />
            <div>
              <h3 className="text-white font-semibold">
                Fast document capture
              </h3>
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
              <h3 className="text-white font-semibold">
                Secure access controls
              </h3>
              <p className="text-white/70 text-sm">
                Role-based permissions and activity logs for compliance.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Column - Form (60% width) */}
      <div className="flex-1 lg:w-[60%] flex items-center justify-center p-4 lg:p-6 pt-10 lg:pt-6">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <div className="relative w-full h-80 lg:h-72 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
              {/* Folder tab on TOP RIGHT (decorative) */}
              <div
                className="work-5 bg-gradient-to-r from-emerald-300 to-emerald-300 w-full h-full rounded-2xl rounded-tr-none relative 
                after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-32 after:h-4 after:bg-gradient-to-r after:from-emerald-300 after:to-emerald-300 after:rounded-t-2xl 
                before:absolute before:content-[''] before:-top-[14px] before:right-[123px] before:w-4 before:h-4 before:bg-gradient-to-r before:from-emerald-300 before:to-emerald-300 before:[clip-path:polygon(100%_35%,100%_100%,50%_100%)]"
              />

              {/* File layers */}
              <div className="work-4 absolute inset-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl" />
              <div className="work-2 absolute inset-1 bg-emerald-100 dark:bg-emerald-800/40 rounded-2xl" />

              {/* Main folder body - with extension on top left */}
              <div
                className="work-1 absolute bottom-0 bg-gradient-to-t from-emerald-50 to-white dark:from-emerald-950/50 dark:to-card w-full h-[calc(100%-16px)] rounded-2xl rounded-tl-none overflow-hidden
                after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-[80%] after:h-[16px] after:bg-white dark:after:bg-card after:rounded-t-2xl 
                before:absolute before:content-[''] before:-top-[10px] before:left-[calc(80%-12px)] before:size-3 before:bg-white dark:before:bg-card before:[clip-path:polygon(0_14%,50%_100%,0%_100%)]"
              >
                <div className="absolute inset-0 p-6 flex flex-col z-10 justify-center">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-base font-bold text-foreground">
                      Sign In
                    </h2>
                    <span className="text-sm bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2 py-1 rounded-full inline-flex items-center gap-1 shadow-sm transition-transform transform hover:-translate-y-0.5 hover:scale-105">
                      <Shield className="w-3 h-3 text-emerald-700" />
                      <span className="hidden sm:inline">Secure</span>
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    Fill in your Employee ID or Email and password to continue.
                  </p>

                  <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                    <div className="relative">
                      <label className="sr-only">Employee ID or Email</label>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <input
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Employee ID or Email"
                        className="w-full pl-10 pr-3 py-2 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground"
                        required
                      />
                    </div>

                    <div className="relative">
                      <label className="sr-only">Password</label>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        type={showPassword ? "text" : "password"}
                        className="w-full pl-10 pr-10 py-2 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex justify-end mt-1">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 active:translate-y-[1px] shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60"
                        disabled={loading}
                      >
                        {loading ? "Signing in..." : "Sign In"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <p className="text-foreground/60 text-center italic text-sm relative z-10 mt-20 animate-pulse">
                Powered by <span className="font-extrabold">x100</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}