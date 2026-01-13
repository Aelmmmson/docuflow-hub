/**
 * StatusBadge Component
 * =====================
 * Colored status badge for various statuses.
 */

import { cn } from "@/lib/utils";

type StatusType =
  | "active"
  | "inactive"
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "paid"
  | "pending"
  | "open"
  | "in_progress"
  | "resolved"
  | "closed"
  | "yes"
  | "no";

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  draft: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  submitted: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  paid: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  yes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  no: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");
  const style = statusStyles[normalizedStatus] || statusStyles.inactive;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
