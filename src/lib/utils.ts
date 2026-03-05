import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a string to Title Case (e.g., "ANDERSON BEN" -> "Anderson Ben")
 */
export function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Extracts a user-friendly error message from an API response or error object.
 */
export function getErrorMessage(err: unknown, fallback: string = "An unexpected error occurred"): string {
  if (!err) return fallback;

  // Handle Axios-style error objects
  if (typeof err === "object" && "response" in err) {
    const axiosErr = err as {
      code?: string;
      message?: string;
      response?: { data?: { result?: string; message?: string; error?: string } };
    };

    // Check specifically for global network connection issues
    if (axiosErr.code === "ERR_NETWORK" || axiosErr.message === "Network Error") {
      return "Network error: Connection to the server failed. Please check your internet connection.";
    }

    return axiosErr.response?.data?.result ||
      axiosErr.response?.data?.message ||
      axiosErr.response?.data?.error ||
      (err instanceof Error ? err.message : fallback);
  }

  // Handle standard Error objects
  if (err instanceof Error) {
    return err.message;
  }

  // Handle string errors
  if (typeof err === "string") {
    return err;
  }

  return fallback;
}
/**
 * Formats a number or string as a currency/amount string with comma separators.
 * e.g., 3123.45 -> "3,123.45"
 */
export function formatAmount(amount: string | number | undefined | null): string {
  if (amount === undefined || amount === null || amount === "") return "—";

  const numericValue = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericValue)) return "—";

  return numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
