import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface AmountInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string | number;
  onValueChange?: (rawValue: string, formattedValue: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** Helper to format raw number/string into comma-separated monetary format */
export function formatAmountWithCommas(value: string | number): string {
  if (value === null || value === undefined || value === "") return "";
  const str = String(value).replace(/,/g, "");
  
  // Allow single trailing dot or minus while typing
  if (str === "." || str === "-") return str;
  if (isNaN(Number(str))) return String(value);

  const parts = str.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

/** Helper to strip commas from formatted amount string */
export function parseRawAmount(formatted: string): string {
  return formatted.replace(/,/g, "");
}

export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  ({ className, value, onValueChange, onChange, placeholder = "0.00", ...props }, ref) => {
    // Internal display state
    const displayValue = formatAmountWithCommas(value ?? "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // Allow only numbers, commas, negative sign, and a single decimal point
      const cleaned = val.replace(/[^0-9.-]/g, "");
      
      // Ensure only one decimal point
      const parts = cleaned.split(".");
      let sanitized = parts[0];
      if (parts.length > 1) {
        sanitized += "." + parts.slice(1).join("");
      }

      const rawValue = parseRawAmount(sanitized);
      const formatted = formatAmountWithCommas(sanitized);

      if (onValueChange) {
        onValueChange(rawValue, formatted);
      }

      if (onChange) {
        // Create synthetic event with raw numeric value for form handlers expecting standard e.target.value
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: rawValue,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "text-right font-mono tracking-wide rounded-[7px]",
          className
        )}
      />
    );
  }
);

AmountInput.displayName = "AmountInput";
