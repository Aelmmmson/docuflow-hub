// src/components/shared/NotificationDropdown.tsx
import React, { useState } from "react";
import { Bell, CheckCircle2, FileText, AlertCircle, Clock, Trash2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications, AppNotification } from "@/context/NotificationContext";
import { getCurrentUser } from "@/lib/auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    setIsOpen(false);

    const userRole = (currentUser?.role_name || "").toLowerCase();

    // Determine destination route based on role and notification action
    let targetPath = "/approval";
    if (userRole === "finance") {
      targetPath = "/finance-approvals";
    } else if (userRole === "originator" || userRole === "admin") {
      targetPath = "/document-capture";
    }

    if (notif.docId) {
      if (userRole === "originator" || userRole === "admin") {
        navigate(`/document-capture?tab=enquiry&docId=${encodeURIComponent(notif.docId)}`);
      } else {
        navigate(`${targetPath}?docId=${encodeURIComponent(notif.docId)}`);
      }
    } else {
      navigate(targetPath);
    }
  };

  const getActionIcon = (action?: string) => {
    switch (action) {
      case "SUBMITTED":
        return <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />;
      case "APPROVED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />;
      case "REJECTED":
        return <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />;
      default:
        return <Bell className="h-4 w-4 text-blue-400 flex-shrink-0" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return "Recent";
    }
  };

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-xl border border-transparent hover:border-blue-500/30 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 group transition-all duration-200"
              >
                <Bell className="h-4.5 w-4.5 text-foreground/80 group-hover:text-white transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Notifications & Activities</p>
          </TooltipContent>
        </Tooltip>

      <PopoverContent align="end" className="w-80 sm:w-96 p-0 rounded-2xl shadow-2xl border border-border z-[9999] bg-popover text-popover-foreground">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">Activities & Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-3xs font-medium px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Read All
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={clearNotifications}
                title="Clear all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs flex flex-col items-center justify-center gap-2">
              <Bell className="h-8 w-8 text-muted-foreground/30" />
              <span>No notifications yet</span>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={cn(
                  "flex items-start gap-3 p-3 text-xs cursor-pointer transition-colors hover:bg-accent/50",
                  !notif.read && "bg-blue-50/50 dark:bg-blue-950/20 font-medium"
                )}
              >
                <div className="mt-0.5">{getActionIcon(notif.action)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-semibold text-foreground truncate">{notif.title}</span>
                    <span className="text-3xs text-muted-foreground flex items-center gap-0.5 flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatTime(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                  {notif.docId && (
                    <span className="inline-block mt-1 text-3xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                      Ref: {notif.docId}
                    </span>
                  )}
                </div>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
    </TooltipProvider>
  );
}
