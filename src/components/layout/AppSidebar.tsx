// src/components/layout/AppSidebar.tsx
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FileInput,
  Settings,
  CheckCircle,
  DollarSign,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { logout, getCurrentUser } from "@/lib/auth";
import api from "@/lib/api";

// Base navigation items with Home icon for Dashboard
const baseNavigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Document Capture", href: "/document-capture", icon: FileInput },
  { name: "Approval", href: "/approval", icon: CheckCircle },
  { name: "Finance Approvals", href: "/finance-approvals", icon: DollarSign },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Scrolling text component for expanded sidebar mode
function ScrollingText({
  text,
  className,
}: {
  text: string;
  className?: string;
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
      setTimeout(() => {
        setIsScrolling(true);
        setTimeout(() => {
          setIsScrolling(false);
        }, 10000);
      }, 1500);
    };

    runCycle();
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
          willChange: isScrolling ? "transform" : "auto",
        }}
      >
        {text}
        {shouldScroll && isScrolling && <span className="inline-block px-8">{text}</span>}
      </div>
    </div>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Mobile sidebar state: Default to OPEN on mobile as Canva-style vertical rail
  const [isMobileOpen, setIsMobileOpen] = useState(true);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentUser = getCurrentUser();
  const firstName = currentUser?.first_name || "";
  const lastName = currentUser?.last_name || "";
  const displayName = currentUser
    ? `${firstName} ${lastName}`.trim()
    : "Guest";
  const displayEmail = currentUser?.email || "—";
  const displayRole = currentUser?.role_name || "—";

  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : (displayName[0] || "U").toUpperCase();

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

    switch (role) {
      case "admin":
        return baseNavigation.filter(
          (item) => item.name !== "Approval" && item.name !== "Finance Approvals"
        );

      case "approver":
        return baseNavigation.filter(
          (item) => item.name === "Dashboard" || item.name === "Approval"
        );

      case "originator":
        return baseNavigation.filter(
          (item) => item.name === "Dashboard" || item.name === "Document Capture"
        );

      case "finance":
        return baseNavigation.filter(
          (item) => item.name === "Dashboard" || item.name === "Finance Approvals"
        );

      default:
        return baseNavigation.filter((item) => item.name === "Dashboard");
    }
  };

  const navItems = getFilteredNavigation();

  // Effective compact mode: Either desktop is collapsed OR on mobile screen where rail mode applies
  const isCompactMode = isMobileScreen || isCollapsed;

  return (
    <>
      {/* Mobile Header Toggle Icon (Top Left floating button when sidebar is collapsed on mobile) */}
      {isMobileScreen && !isMobileOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-3 left-3 z-[110] lg:hidden h-10 w-10 rounded-xl bg-card border-border shadow-md text-foreground hover:bg-accent"
          onClick={() => setIsMobileOpen(true)}
          title="Open Navigation"
        >
          <PanelLeftOpen className="h-5 w-5 text-primary" />
        </Button>
      )}

      {/* Mobile Backdrop Overlay (Allows tapping outside to collapse on small screens) */}
      {isMobileScreen && isMobileOpen && (
        <div
          className="fixed inset-0 z-[95] bg-black/30 backdrop-blur-[2px] lg:hidden animate-in fade-in-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container: Guarantee overflow-x-hidden so no horizontal scrolling occurs */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[100] flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:z-auto shadow-xl lg:shadow-none overflow-x-hidden",
          // Width: Compact Canva style (w-20) on mobile & desktop-collapsed, or Full (w-64) on desktop
          isCompactMode ? "w-20" : "w-64",
          // Visibility on Mobile: Open by default, translate off-screen when explicitly collapsed by user
          isMobileScreen
            ? isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        )}
      >
        {/* Header / Brand & Toggle Button */}
        <div className={cn("p-4 flex items-center justify-between", isCompactMode && "px-2 py-4 flex-col gap-3")}>
          <div className={cn("flex items-center gap-3", isCompactMode && "flex-col gap-2")}>
            {/* Clean Logo Container - White background preserved in both Light and Dark mode */}
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center shadow-sm flex-shrink-0">
              <img
                src="/usg-logo-O.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            {!isCompactMode && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-extrabold text-sidebar-foreground tracking-tight">
                  xDMS
                </span>
                <span className="text-[10px] text-sidebar-foreground/60 font-medium truncate">
                  Document Manager
                </span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          {!isMobileScreen && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-foreground hover:bg-sidebar-accent transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-primary" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Mobile Collapse Button at top of Canva rail */}
          {isMobileScreen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-foreground hover:bg-sidebar-accent transition-colors"
              title="Close Navigation"
            >
              <PanelLeftClose className="w-5 h-5 text-primary" />
            </button>
          )}
        </div>

        {/* Navigation Items (Never horizontally scrolls; breaks long titles cleanly) */}
        <nav className={cn("flex-1 space-y-2 overflow-y-auto overflow-x-hidden pt-2", isCompactMode ? "px-2" : "px-3")}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "w-full flex transition-all duration-200 group relative overflow-hidden",
                  isCompactMode
                    ? "flex-col items-center justify-center py-2.5 px-1 gap-1.5 rounded-2xl text-center"
                    : "flex-row items-center gap-3 rounded-xl px-4 py-3 text-left",
                  isActive
                    ? "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold shadow-sm ring-1 ring-blue-300/60 dark:ring-blue-800/60"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                )}
              >
                <Icon
                  className={cn(
                    "flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                    isCompactMode ? "h-5 w-5" : "h-4 w-4",
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-sidebar-foreground/75 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  )}
                />
                <span
                  className={cn(
                    "leading-tight break-words whitespace-normal max-w-full",
                    isCompactMode
                      ? "text-[10px] px-0.5 text-center tracking-tight"
                      : "text-xs"
                  )}
                >
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section (Canva Style Profile Circle Badge) */}
        <div className={cn("p-3 overflow-x-hidden", isCompactMode && "px-2 py-4")}>
          {isCompactMode ? (
            /* Canva Style Vertical Profile Badge */
            <div className="pt-3 border-t border-sidebar-border flex flex-col items-center gap-3">
              <div
                onClick={() => navigate("/profile?tab=overview")}
                className="relative cursor-pointer group"
                title="Account Profile"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-extrabold flex items-center justify-center shadow-md group-hover:scale-105 transition-transform ring-2 ring-blue-500/20">
                  {initials}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
              </div>

              <button
                onClick={handleLogout}
                className="h-8 w-8 rounded-xl flex items-center justify-center text-sidebar-foreground/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Expanded Profile Layout */
            <div className="pt-2 border-t border-sidebar-border">
              <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-3 hover:bg-sidebar-accent/80 transition-colors cursor-pointer group">
                <div
                  onClick={() => navigate("/profile?tab=overview")}
                  className="relative flex-shrink-0"
                  title="View My Profile"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shadow-md group-hover:scale-105 transition-transform">
                    {initials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-sidebar" />
                </div>
                <div
                  onClick={() => navigate("/profile?tab=overview")}
                  className="flex-1 min-w-0"
                  title="View My Profile"
                >
                  <ScrollingText
                    text={displayName}
                    className="text-xs font-semibold text-sidebar-foreground capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  />
                  <ScrollingText
                    text={displayEmail}
                    className="text-[11px] text-sidebar-foreground/60"
                  />
                  <p className="text-[10px] text-sidebar-foreground/60 truncate capitalize">
                    {displayRole}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/60 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex-shrink-0"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}