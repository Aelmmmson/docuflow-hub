import { Eye, Edit2, Send, ExternalLink, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { GeneratedDocument } from "./GeneratedTab";
import { cn, toTitleCase, formatAmount } from "@/lib/utils";

interface DocumentCardProps {
  document: GeneratedDocument;
  onView: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
  onViewDocument?: () => void;
  onShowRejectionReason?: () => void;
  onShowApprovalDetails?: () => void;
  mode?: "generated" | "enquiry";
}

export function DocumentCard({
  document,
  onView,
  onEdit,
  onSubmit,
  onViewDocument,
  onShowRejectionReason,
  onShowApprovalDetails,
  mode = "generated"
}: DocumentCardProps) {
  const [showActions, setShowActions] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Status mapping for the colored border
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "hsl(195, 74%, 62%)";
      case "SUBMITTED": return "#F39C12";
      case "APPROVED": return "#27AE60";
      case "REJECTED": return "#E74C3C";
      case "PAID": return "#8E44AD";
      default: return "#BDC3C7";
    }
  };

  const statusColor = getStatusColor(document.status);

  // Theme-aware colors
  const primaryClr = isDark ? "#1C204B" : "#FFFFFF";
  const textClr = isDark ? "#FFFFFF" : "#1C204B";
  const dotClr = isDark ? "#BBC0FF" : "#1C204B";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(28, 32, 75, 0.1)";
  const shadowValue = isDark ? "0 10px 40px rgba(0,0,0,0.5)" : "0 10px 30px rgba(28, 32, 75, 0.1)";

  // Static image section background
  const imgBgClr = isDark ? "#282d5e" : "#F1F5F9";

  return (
    <div
      onClick={onView}
      style={{
        "--primary-clr": primaryClr,
        "--dot-clr": dotClr,
        "--accent-clr": statusColor,
        width: "100%",
        height: "140px",
        // fontFamily: "'Inter', Arial, sans-serif",
        color: textClr,
        display: "grid",
        cursor: "pointer",
        gridTemplateRows: "32px 1fr",
      } as React.CSSProperties}
      className="card group relative"
    >
      {/* Img Section (Static Background) */}
      <div
        className="img-section transition-all duration-300 ease-[cubic-bezier(0.25, 0.46, 0.45, 0.94)] rounded-t-[10px] flex justify-end items-start overflow-hidden group-hover:translate-y-[0.8em] px-3 pt-2"
        style={{ background: imgBgClr }}
      >
        <FileText
          className="w-8 h-8 rotate-[12deg] translate-x-1 shrink-0 opacity-80"
          style={{ color: statusColor }}
        />
      </div>

      {/* Card Body with Status Top Border - Using explicit styles for theme reactivity */}
      <div
        className="card-desc rounded-[10px] p-[16px] relative top-[-10px] flex flex-col z-10 transition-all shadow-xl"
        style={{
          backgroundColor: primaryClr,
          borderLeft: `1px solid ${borderColor}`,
          borderRight: `1px solid ${borderColor}`,
          borderBottom: `1px solid ${borderColor}`,
          borderTop: `4px solid ${statusColor}`,
          color: textClr
        }}
      >
        {/* Dedicated Watermark Container for clipping icon only */}
        <div className="absolute inset-0 rounded-[10px] overflow-hidden pointer-events-none z-0">
          {/* <FileText
            className="absolute -right-4 -bottom-6 w-32 h-32 opacity-[0.03] dark:opacity-[0.05] rotate-[15deg] select-none"
            style={{ color: textClr }}
            aria-hidden="true"
          /> */}
          <img
            src="./file.svg"
            className="absolute -right-4 -bottom-6 w-32 h-32 opacity-[0.03] dark:opacity-[0.05] rotate-[15deg] select-none"
            style={{ color: textClr }}
            aria-hidden="true"
          />
        </div>

        {/* Header: Title & Info Menu - z-20 for Popover overlap */}
        <div className="flex items-center justify-between mb-4 relative z-20">
          <div className="card-title text-[0.85em] font-medium truncate capitalize opacity-90">
            {toTitleCase(document.type)}
          </div>

          {/* Actions Hover Zone (Ellipses Only) */}
          <div
            className="relative"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
          >
            <div className="card-menu flex gap-[3.5px] p-2 -mr-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
              <div className="dot w-[4px] h-[4px] rounded-full" style={{ backgroundColor: dotClr }}></div>
              <div className="dot w-[4px] h-[4px] rounded-full" style={{ backgroundColor: dotClr }}></div>
              <div className="dot w-[4px] h-[4px] rounded-full" style={{ backgroundColor: dotClr }}></div>
            </div>

            {/* Actions Popover */}
            {showActions && (
              <div
                className="absolute right-0 top-full mt-1 border rounded-lg p-1.5 flex flex-col gap-0.5 z-50 animate-in fade-in zoom-in-95 duration-150 min-w-[125px]"
                style={{
                  backgroundColor: isDark ? "#252a5c" : "#FFFFFF",
                  borderColor: borderColor,
                  boxShadow: shadowValue
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-[10px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
                  style={{ color: textClr }}
                  onClick={onView}
                >
                  <Eye className="w-3 h-3 text-blue-500" /> View Details
                </button>

                {mode === "generated" && document.status === "DRAFT" && (
                  <>
                    <button
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-[10px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
                      style={{ color: textClr }}
                      onClick={onEdit}
                    >
                      <Edit2 className="w-3 h-3 text-amber-500" /> Edit Record
                    </button>
                    <button
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-[10px] font-bold text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                      onClick={onSubmit}
                    >
                      <Send className="w-3 h-3" /> Submit
                    </button>
                  </>
                )}

                {document.referenceNumber && (
                  <button
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-[10px] font-semibold hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
                    style={{ color: textClr }}
                    onClick={onViewDocument}
                  >
                    <ExternalLink className="w-3 h-3" /> Open File
                  </button>
                )}

                {mode === "enquiry" && (
                  <>
                    {document.status === "REJECTED" && (
                      <button
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-[10px] font-semibold text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                        onClick={onShowRejectionReason}
                      >
                        <AlertCircle className="w-3 h-3" /> Reason
                      </button>
                    )}
                    {document.status === "APPROVED" && (
                      <button
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-[10px] font-semibold text-primary hover:bg-primary/10 rounded transition-colors"
                        onClick={onShowApprovalDetails}
                      >
                        <CheckCircle className="w-3 h-3" /> Details
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content: Amount & Reference */}
        <div className="flex flex-col flex-1 relative z-10">
          <div className="text-[1.65em] font-medium leading-none tracking-tight mb-auto" style={{ color: textClr }}>
            {formatAmount(document.amount)}
          </div>

          <div className="mt-auto space-y-0.5">
            <p className="text-[0.7em] font-medium tracking-wide uppercase truncate" style={{ color: isDark ? "#BBC0FF99" : "#1C204B99" }}>
              ID: {document.referenceNumber || "PENDING"}
            </p>
            <p className="text-[0.65em] font-normal italic" style={{ color: isDark ? "#BBC0FF66" : "#1C204B66" }}>
              {document.uploadDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
