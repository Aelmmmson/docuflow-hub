import { Eye, Edit2, Send, ExternalLink, Calendar, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GeneratedDocument } from "./GeneratedTab";

interface DocumentCardProps {
  document: GeneratedDocument;
  onView: () => void;
  onEdit?: () => void; // Optional for Enquiry
  onSubmit?: () => void; // Optional for Enquiry
  onViewDocument?: () => void;
  onShowRejectionReason?: () => void; // New for Enquiry
  onShowApprovalDetails?: () => void; // New for Enquiry
  mode?: "generated" | "enquiry"; // Add mode to differentiate
}

export function DocumentCard({ 
  document, 
  onView, 
  onEdit, 
  onSubmit,
  onViewDocument,
  onShowRejectionReason,
  onShowApprovalDetails,
  mode = "generated" // Default to generated tab behavior
}: DocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSubmit) onSubmit();
  };

  const handleViewDocument = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDocument) {
      onViewDocument();
    }
  };

  const handleShowRejectionReason = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShowRejectionReason) {
      onShowRejectionReason();
    }
  };

  const handleShowApprovalDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShowApprovalDetails) {
      onShowApprovalDetails();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Show tooltip when hovering over the main content area
    const isOverContent = x > 20 && x < rect.width - 20 && y > 60 && y < rect.height - 20;
    
    if (isOverContent && (document.description || document.customerNumber)) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
      
      // Clear existing timeout
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      
      // Show tooltip after a brief delay (like Windows explorer)
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, 500);
    } else {
      setShowTooltip(false);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  };

  // Format status for the pill
  const getStatusText = (status: string) => {
    switch (status) {
      case "DRAFT": return "Draft";
      case "SUBMITTED": return "Submitted";
      case "APPROVED": return "Approved";
      case "REJECTED": return "Rejected";
      case "PAID": return "Paid";
      default: return status;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-blue-400/90 dark:bg-blue-500/90";
      case "SUBMITTED": return "bg-orange-400/90 dark:bg-orange-500/90";
      case "APPROVED": return "bg-green-400/90 dark:bg-green-500/90";
      case "REJECTED": return "bg-red-400/90 dark:bg-red-500/90";
      case "PAID": return "bg-purple-400/90 dark:bg-purple-500/90";
      default: return "bg-gray-400/90 dark:bg-gray-500/90";
    }
  };

  // Determine which action buttons to show based on mode and document status
  const getActionButtons = () => {
    if (mode === "enquiry") {
      // Enquiry mode: Show View for all, and additional buttons based on status
      return (
        <>
          {/* View Details Button - Always shown */}
          <div className="relative group/btn">
            <button
              onClick={handleView}
              className="flex items-center justify-center w-6 h-6 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-[9px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
              View Details
            </div>
          </div>

          {/* Rejection Reason Button - Only for REJECTED status */}
          {document.status === "REJECTED" && onShowRejectionReason && (
            <div className="relative group/btn">
              <button
                onClick={handleShowRejectionReason}
                className="flex items-center justify-center w-6 h-6 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-[9px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                Rejection Reason
              </div>
            </div>
          )}

          {/* Approval Details Button - Only for APPROVED status */}
          {document.status === "APPROVED" && onShowApprovalDetails && (
            <div className="relative group/btn">
              <button
                onClick={handleShowApprovalDetails}
                className="flex items-center justify-center w-6 h-6 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-[9px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                Approval Details
              </div>
            </div>
          )}
        </>
      );
    } else {
      // Generated mode: Original logic for DRAFT documents
      if (isHovered && document.status === "DRAFT") {
        return (
          <>
            {/* View Details Button */}
            <div className="relative group/btn">
              <button
                onClick={handleView}
                className="flex items-center justify-center w-6 h-6 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-[9px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                View Details
              </div>
            </div>

            {/* Edit Button */}
            <div className="relative group/btn">
              <button
                onClick={handleEdit}
                className="flex items-center justify-center w-6 h-6 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-[9px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                Edit
              </div>
            </div>

            {/* Submit Button */}
            <div className="relative group/btn">
              <button
                onClick={handleSubmit}
                className="flex items-center justify-center w-6 h-6 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-[9px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                Submit
              </div>
            </div>
          </>
        );
      }
      return null;
    }
  };

  // Determine when to show action buttons
  const shouldShowActions = () => {
    if (mode === "enquiry") {
      // In enquiry mode, show actions for all documents on hover
      return isHovered;
    } else {
      // In generated mode, only show for DRAFT documents on hover
      return isHovered && document.status === "DRAFT";
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm dark:hover:shadow-gray-900/30 transition-all cursor-pointer w-full max-w-[180px] group"
      >
        {/* Action Buttons - Top Right of Card (shows on card hover) */}
        {shouldShowActions() && (
          <div className="absolute -top-5 -right-3.5 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full px-2 py-1.5 shadow-md z-30 border border-gray-200 dark:border-gray-700">
            {getActionButtons()}
          </div>
        )}
        
        {/* Status Badge - Top Left of Card */}
        <div className="absolute -top-3 left-2 z-20">
          <span className={`px-2 py-0.5 ${getStatusColor(document.status)} text-white text-[9px] rounded-full font-medium shadow-sm`}>
            {getStatusText(document.status)}
          </span>
        </div>

        {/* Image/Thumbnail Section - Compact */}
        <div 
          className="relative w-full mb-2.5"
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
        >
          {/* Thumbnail Container - Simple white background */}
          <div className="w-full h-28 flex items-start justify-start rounded-md overflow-hidden group/image bg-gray-50 dark:bg-gray-900/50">
            {/* Image */}
            <img 
              src={"/file.svg"} 
              alt={document.type} 
              className="absolute inset-0 w-full h-full object-contain rounded-md opacity-100 group-hover/image:opacity-100 transition-opacity z-0 p-3"
            />
            
            {/* View Document Overlay */}
            {isImageHovered && document.referenceNumber && (
              <div className="absolute inset-0 bg-black/30 dark:bg-black/40 rounded-md flex items-center justify-center transition-opacity z-20">
                <div className="relative group/view">
                  <button
                    onClick={handleViewDocument}
                    className="flex items-center justify-center w-9 h-9 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-all transform hover:scale-105"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-[10px] rounded whitespace-nowrap opacity-0 group-hover/view:opacity-100 transition-opacity pointer-events-none">
                    View Document
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Section - Compact */}
        <div className="flex flex-col gap-1 flex-1 text-center">
          {/* Document ID and Title */}
          <div className="min-w-0">
            <h2 className="text-gray-900 dark:text-gray-100 text-[11px] font-semibold leading-tight line-clamp-1 mb-0.5">
              ID: {document.referenceNumber}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-[10px] font-medium leading-tight line-clamp-1">
              {document.type}
            </p>
          </div>

          {/* Metadata - Date and Amount with reduced spacing */}
          <div className="flex items-center justify-between text-[10px] mt-0.5">
            {/* Date */}
            <div className="flex items-center gap-0.5 text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3 text-gray-400 dark:text-gray-500" />
              <span>{document.uploadDate}</span>
            </div>

            {/* Amount (only show if exists) */}
            {document.amount && (
              <div className="flex items-center gap-0.5 font-medium text-gray-700 dark:text-gray-300">
                <span>${document.amount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Windows Explorer-style Tooltip */}
      {showTooltip && (document.description || document.customerNumber) && (
        <div 
          className="fixed z-50 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-200 text-sm rounded-lg shadow-xl p-3 max-w-xs pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
          }}
        >
          <div className="space-y-2">
            {/* Description */}
            {document.description && (
              <div>
                <div className="text-gray-300 dark:text-gray-400 text-xs font-medium mb-1">Description:</div>
                <div className="text-white dark:text-gray-200 text-sm leading-relaxed">{document.description}</div>
              </div>
            )}
            
            {/* Customer Number */}
            {document.customerNumber && (
              <div>
                <div className="text-gray-300 dark:text-gray-400 text-xs font-medium mb-1">Customer:</div>
                <div className="text-white dark:text-gray-200 text-sm">{document.customerNumber}</div>
              </div>
            )}
          </div>
          
          {/* Tooltip Arrow */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-gray-900 dark:border-r-gray-800"></div>
        </div>
      )}
    </>
  );
}