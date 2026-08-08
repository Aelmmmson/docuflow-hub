/**
 * UserProfileDropdown Component
 * ============================
 * Topbar user profile dropdown with custom tooltip, vertical centered profile header,
 * high-contrast hover menu items, and direct tab navigation.
 */

import { useNavigate } from "react-router-dom";
import { User as UserIcon, KeyRound, LogOut, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCurrentUser, logout } from "@/lib/auth";
import api from "@/lib/api";
import { toTitleCase } from "@/lib/utils";

export function UserProfileDropdown() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const firstName = currentUser?.first_name || "";
  const lastName = currentUser?.last_name || "";
  const fullName = toTitleCase(`${firstName} ${lastName}`.trim()) || "User Profile";
  const email = currentUser?.email || "—";
  const role = currentUser?.role_name || "User";

  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : (fullName[0] || "U").toUpperCase();

  const handleLogout = async () => {
    try {
      await api.get("/user/logout");
    } catch (err) {
      console.error("[LOGOUT ERROR]:", err);
    }
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                className="relative group flex items-center justify-center focus:outline-none"
                aria-label="User Account Menu"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-md group-hover:scale-105 transition-all ring-2 ring-blue-500/20 group-hover:ring-blue-500/40">
                  {initials}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" className="text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-none shadow-md">
            <p>Account Profile & Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent
        align="end"
        className="w-72 p-2 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl bg-card text-card-foreground animate-in fade-in-50 zoom-in-95"
      >
        {/* Redesigned Vertical Centered Header */}
        <DropdownMenuLabel className="p-4 font-normal flex flex-col items-center text-center">
          {/* 1. Initial Badge at top */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-lg ring-4 ring-blue-500/10 mb-2.5">
            {initials}
          </div>

          {/* 2. Name beneath initial badge */}
          <span className="text-sm font-bold text-foreground capitalize tracking-tight">{fullName}</span>

          {/* 3. Email beneath name */}
          <span className="text-xs text-muted-foreground truncate max-w-[220px] mt-0.5">{email}</span>

          {/* 4. Role beneath email */}
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80">
              <ShieldCheck className="w-3 h-3 text-blue-500" />
              {role}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1.5" />

        {/* 5. Menu items beneath role */}
        <DropdownMenuItem
          onClick={() => navigate("/profile?tab=overview")}
          className="cursor-pointer py-2.5 px-3 rounded-xl group hover:bg-blue-50 dark:hover:bg-blue-950/50 focus:bg-blue-50 dark:focus:bg-blue-950/50 gap-2.5 text-xs font-semibold text-foreground transition-colors"
        >
          <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
          <span className="group-hover:text-blue-600 dark:group-hover:text-blue-300">My Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate("/profile?tab=security")}
          className="cursor-pointer py-2.5 px-3 rounded-xl group hover:bg-amber-50 dark:hover:bg-amber-950/50 focus:bg-amber-50 dark:focus:bg-amber-950/50 gap-2.5 text-xs font-semibold text-foreground transition-colors"
        >
          <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
          <span className="group-hover:text-amber-600 dark:group-hover:text-amber-300">Change Password</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer py-2.5 px-3 rounded-xl group hover:bg-rose-50 dark:hover:bg-rose-950/50 focus:bg-rose-50 dark:focus:bg-rose-950/50 text-rose-600 dark:text-rose-400 gap-2.5 text-xs font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
          <span className="group-hover:text-rose-700 dark:group-hover:text-rose-300">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
