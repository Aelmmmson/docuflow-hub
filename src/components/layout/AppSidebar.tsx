import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FileInput, Settings, FileText, Menu, X, LogOut, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="8" height="3" rx="1" />
      <rect x="13" y="6" width="8" height="3" rx="1" />
      <rect x="3" y="11" width="8" height="3" rx="1" />
      <rect x="13" y="11" width="8" height="3" rx="1" />
      <rect x="3" y="16" width="18" height="3" rx="1" />
    </svg>
  );
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Document Capture", href: "/document-capture", icon: FileInput },
  { name: "Approval", href: "/approval", icon: CheckCircle },
];

const user = {
  name: "John Anderson",
  email: "john@company.com",
};

export function AppSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden h-9 w-9"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out lg:static lg:z-auto",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo with Menu Toggle */}
        <div className="p-4">
          <div className="flex items-center gap-3">
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
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
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
                    isCollapsed ? "justify-center rounded-lg p-3" : "rounded-xl px-4 py-3"
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
        <div className="p-3 space-y-2">
          {/* Settings */}
          <div className="relative group">
            <NavLink
              to="/settings"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "w-full flex items-center gap-3 text-xs font-medium transition-all duration-200",
                location.pathname === "/settings"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent",
                isCollapsed ? "justify-center rounded-lg p-3" : "rounded-xl px-4 py-3"
              )}
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </NavLink>
            {isCollapsed && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-sidebar-foreground text-sidebar rounded-lg text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Settings
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-sidebar-foreground" />
              </div>
            )}
          </div>

          {/* User Profile - Full */}
          {!isCollapsed && (
            <div className="pt-2 border-t border-sidebar-border">
              <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-sidebar" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-sidebar-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-2xs text-sidebar-foreground/60 truncate">
                    {user.email}
                  </p>
                </div>
                <button 
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
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
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-sidebar" />
                </div>
              </div>
              <div className="absolute left-full ml-2 bottom-0 px-3 py-2 bg-sidebar-foreground text-sidebar rounded-lg text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {user.name}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-sidebar-foreground" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
