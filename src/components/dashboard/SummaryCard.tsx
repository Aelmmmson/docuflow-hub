import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  count: number;
  icon: ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
  delay?: number;
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function SummaryCard({ title, count, icon, variant = "default", delay = 0 }: SummaryCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl bg-card p-4 shadow-card-md card-hover animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-card-foreground">
            {count.toLocaleString()}
          </p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", variantStyles[variant])}>
          {icon}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
