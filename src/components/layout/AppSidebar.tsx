// src/components/AppSidebar.tsx
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileInput,
  Settings,
  FileText,
  Menu,
  X,
  LogOut,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { logout } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import api from "@/lib/api";

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="6" width="8" height="3" rx="1" />
      <rect x="13" y="6" width="8" height="3" rx="1" />
      <rect x="3" y="11" width="8" height="3" rx="1" />
      <rect x="13" y="11" width="8" height="3" rx="1" />
      <rect x="3" y="16" width="18" height="3" rx="1" />
    </svg>
  );
}

// Base navigation items
const baseNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Document Capture", href: "/document-capture", icon: FileInput },
  { name: "Approval", href: "/approval", icon: CheckCircle },
  { name: "Finance Approvals", href: "/finance-approvals", icon: DollarSign },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Scrolling text component
function ScrollingText({ 
  text, 
  className, 
  maxLength = 18 
}: { 
  text: string; 
  className?: string; 
  maxLength?: number;
}) {
  const [shouldScroll, setShouldScroll] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      setShouldScroll(textWidth > containerWidth);
    }
  }, [text]);

  useEffect(() => {
    if (!shouldScroll) return;

    const runCycle = () => {
      // Start scrolling after initial delay
      setTimeout(() => {
        setIsScrolling(true);
        
        // Stop scrolling after animation completes
        setTimeout(() => {
          setIsScrolling(false);
        }, 10000); // 10 second scroll duration
      }, 1500); // 1.5 second initial delay
    };

    // Run first cycle
    runCycle();

    // Repeat cycle every 13.5 seconds (1.5s delay + 10s scroll + 2s pause)
    const cycleInterval = setInterval(runCycle, 13500);

    return () => clearInterval(cycleInterval);
  }, [shouldScroll]);

  return (
    <div ref={containerRef} className="overflow-hidden relative">
      <div
        ref={textRef}
        className={cn(
          "whitespace-nowrap inline-block transition-transform",
          isScrolling && "animate-marquee-scroll",
          className
        )}
        style={{
          willChange: isScrolling ? 'transform' : 'auto'
        }}
      >
        {text}
        {shouldScroll && isScrolling && <span className="inline-block px-8">{text}</span>}
      </div>
      {shouldScroll && !isScrolling && (
        <span className={cn("absolute right-0 top-0 bg-gradient-to-l from-sidebar-accent via-sidebar-accent to-transparent pl-4 pr-1 py-1", className)}>
          ...
        </span>
      )}
    </div>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentUser = getCurrentUser();
  const displayName = currentUser 
    ? `${currentUser.first_name} ${currentUser.last_name}` 
    : "Guest";
  const displayEmail = currentUser?.email || "—";
  const displayRole = currentUser?.role_name || "—";

  const handleLogout = async () => {
    try {
      await api.get("/user/logout");
    } catch (err) {
      console.error("[LOGOUT] Backend call failed:", err);
    }
    logout();
    navigate("/login", { replace: true });
  };

  // Get filtered navigation based on user role
  const getFilteredNavigation = () => {
    const role = currentUser?.role_name?.toLowerCase() || "";
    
    switch(role) {
      case "admin":
        // Admin: Can see all except Approval and Finance Approvals
        return baseNavigation.filter(item => 
          item.name !== "Approval" && item.name !== "Finance Approvals"
        );
        
      case "approver":
        // Approver: Only Dashboard and Approval
        return baseNavigation.filter(item => 
          item.name === "Dashboard" || item.name === "Approval"
        );
        
      case "originator":
        // Originator: Only Dashboard and Document Capture
        return baseNavigation.filter(item => 
          item.name === "Dashboard" || item.name === "Document Capture"
        );
        
      case "finance":
        // Finance: Only Dashboard and Finance Approvals
        return baseNavigation.filter(item => 
          item.name === "Dashboard" || item.name === "Finance Approvals"
        );
        
      default:
        // Default: Show Dashboard only for unknown roles
        return baseNavigation.filter(item => item.name === "Dashboard");
    }
  };

  const navItems = getFilteredNavigation();

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden h-9 w-9"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:z-auto overflow-hidden",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo with Menu Toggle */}
        <div className="p-4">
          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow flex-shrink-0"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold text-sidebar-foreground">
                  xDMS
                </span>
                <span className="text-2xs text-sidebar-foreground/60 truncate">
                  Document Manager
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <div key={item.name} className="relative group">
                <NavLink
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "w-full flex items-center gap-3 text-xs font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent",
                    isCollapsed
                      ? "justify-center rounded-lg p-3"
                      : "rounded-xl px-4 py-3",
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-sidebar-foreground text-sidebar rounded-lg text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.name}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-sidebar-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3">
          {/* User Profile - Full */}
          {!isCollapsed && (
            <div className="pt-2 border-t border-sidebar-border">
              <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {displayName.split(" ").map(n => n[0]).join("") || "?"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-sidebar" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* Name with scrolling - Reduced spacing */}
                  <ScrollingText 
                    text={displayName}
                    className="text-xs font-semibold text-sidebar-foreground mb-0.5"
                    maxLength={18}
                  />

                  {/* Email with scrolling - Reduced spacing */}
                  <ScrollingText 
                    text={displayEmail}
                    className="text-2xs text-sidebar-foreground/60 mb-0.5"
                    maxLength={22}
                  />

                  {/* Role – static, no scroll */}
                  <p className="text-2xs text-sidebar-foreground/60 truncate">
                    {displayRole}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Collapsed User Avatar */}
          {isCollapsed && (
            <div className="relative group pt-2 border-t border-sidebar-border">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg cursor-pointer">
                    {displayName.split(" ").map(n => n[0]).join("") || "?"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-sidebar" />
                </div>
              </div>
              <div className="absolute left-full ml-2 bottom-0 px-3 py-2 bg-sidebar-foreground text-sidebar rounded-lg text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {displayName}
                <br />
                {displayEmail}
                <br />
                {displayRole}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Add styles for marquee animation */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .animate-marquee-scroll {
          animation: marquee 10s linear forwards;
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .animate-marquee-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}