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
      response?: {
        status?: number;
        statusText?: string;
        data?: { result?: string; message?: string; error?: string; details?: string };
      };
    };

    // Check specifically for global network connection issues
    if (axiosErr.code === "ERR_NETWORK" || axiosErr.message === "Network Error") {
      return "Network error: Connection to the server failed. Please check your internet connection.";
    }

    // Check for HTTP 413 Payload Too Large
    if (axiosErr.response?.status === 413) {
      return "The uploaded signature image or file size is too large for the server. Please select a smaller image file (under 2MB).";
    }

    // Extract message from response data
    const serverMessage =
      axiosErr.response?.data?.result ||
      axiosErr.response?.data?.message ||
      axiosErr.response?.data?.error ||
      axiosErr.response?.data?.details;

    if (serverMessage && typeof serverMessage === "string") {
      const lower = serverMessage.toLowerCase();

      // Check if server message contains duplicate entry or signature unique error
      if (lower.includes("users_signature_unique") || (lower.includes("duplicate entry") && lower.includes("signature")) || lower.includes("already registered for another user")) {
        return "This signature image is already registered for another user. Please upload a unique signature image.";
      }
      if (lower.includes("users_email_unique") || (lower.includes("duplicate entry") && lower.includes("email"))) {
        return "This email address is already registered for another user.";
      }
      if (lower.includes("users_phone_unique") || (lower.includes("duplicate entry") && lower.includes("phone"))) {
        return "This phone number is already registered for another user.";
      }
      if (lower.includes("users_employee_id_unique") || (lower.includes("duplicate entry") && lower.includes("employee"))) {
        return "This Staff ID / Employee ID is already registered for another user.";
      }

      // Replace generic / unhelpful internal server error strings with user-friendly guidance
      if (lower.includes("internal server error") || lower.includes("see logs for details")) {
        return "A server error occurred while processing your request. If uploading a signature image, please ensure the image is unique to this user and under 2MB.";
      }

      return serverMessage;
    }

    // Status-code fallback checks
    if (axiosErr.response?.status === 409) {
      return "This record or signature image is already registered for another user. Please upload a unique signature image.";
    }

    if (axiosErr.response?.status === 500) {
      return "Server error (500): Failed to save. If you are uploading a signature image, please verify it is under 2MB and unique to this user.";
    }

    if (axiosErr.response?.status === 403) {
      return "Permission denied: You are not authorized to perform this action.";
    }
  }

  // Handle standard Error objects
  if (err instanceof Error) {
    if (err.message.includes("413")) {
      return "The uploaded file size is too large. Please select a smaller file (under 2MB).";
    }
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

/**
 * Formats a document ID/reference number by stripping 'REF-' for filesearch endpoints.
 * e.g., "REF-1785747836" -> "http://10.203.14.169/dms/filesearch-1785747836"
 */
export function getFileSearchUrl(idOrDocId: string | number | undefined | null): string {
  if (!idOrDocId) return "";
  const cleanId = String(idOrDocId).replace(/^REF-/i, "");
  return `http://10.203.14.169/dms/filesearch-${cleanId}`;
}
