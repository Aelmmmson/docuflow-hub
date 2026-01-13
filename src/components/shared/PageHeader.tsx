/**
 * PageHeader Component
 * ====================
 * Displays page title, date/time, and theme toggle consistently across pages.
 */

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div className="animate-fade-in">
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="text-right">
          <p className="text-xs font-medium text-foreground">{formatDate(currentTime)}</p>
          <p className="text-xs text-muted-foreground font-mono">{formatTime(currentTime)}</p>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
