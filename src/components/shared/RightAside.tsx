/**
 * RightAside Component
 * ====================
 * Slide-in panel from the right side of the screen.
 */

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RightAsideProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
  autoCloseAfter?: number; // Auto-close after X seconds
}

export function RightAside({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "md",
  autoCloseAfter,
}: RightAsideProps) {
  // Auto-close timer
  useEffect(() => {
    if (isOpen && autoCloseAfter) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseAfter * 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseAfter, onClose]);

  // Lock body scroll when aside is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Aside Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col bg-card border-l border-border shadow-xl transition-transform duration-300 ease-out w-full",
          widthClasses[width],
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {/* Auto-close indicator */}
        {autoCloseAfter && isOpen && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden">
            <div
              className="h-full bg-primary animate-shrink-width"
              style={{
                animation: `shrinkWidth ${autoCloseAfter}s linear forwards`,
              }}
            />
          </div>
        )}
      </aside>

      {/* Keyframe for auto-close progress bar */}
      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  );
}
