// Lets make the cards vertical rather than horizontal; so this time the texts/information would show under the cover of the whole image section:

import { Eye, Edit2, Send, FileText, ExternalLink, Calendar, DollarSign, User } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GeneratedDocument } from "./GeneratedTab";
import { url } from "inspector";

interface DocumentCardProps {
  document: GeneratedDocument;
  onView: () => void;
  onEdit: () => void;
  onSubmit: () => void;
  onViewDocument?: () => void;
}

export function DocumentCard({ 
  document, 
  onView, 
  onEdit, 
  onSubmit,
  onViewDocument 
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
    onEdit();
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSubmit();
  };

  const handleViewDocument = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDocument) {
      onViewDocument();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Show tooltip when hovering over the main content area (not over buttons)
    const isOverContent = x > 100 && x < rect.width - 100 && y > 50 && y < rect.height - 30;
    
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
      case "DRAFT": return "bg-blue-400/90";
      case "SUBMITTED": return "bg-orange-400/90";
      case "APPROVED": return "bg-green-400/90";
      case "REJECTED": return "bg-red-400/90";
      case "PAID": return "bg-purple-400/90";
      default: return "bg-gray-400/90";
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex items-center gap-4 bg-white border border-blue-50 rounded-2xl p-4 pr-6 hover:bg-blue-50/30 transition-colors cursor-pointer min-w-[320px] w-full group"
      >
        {/* Action Buttons Pill - Top Right */}
        {isHovered && document.status === "DRAFT" && (
          <div className="absolute -top-5 right-4 flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5 shadow-lg z-10 border border-gray-100">
            {/* View Details Button */}
            <div className="relative group/btn">
              <button
                onClick={handleView}
                className="flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-blue-300/20 rounded-full transition-colors"
              >
                <Eye className="w-4 h-4 text-gray-700" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                View Details
              </div>
            </div>

            {/* Edit Button */}
            <div className="relative group/btn">
              <button
                onClick={handleEdit}
                className="flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-blue-300/20 rounded-full transition-colors"
              >
                <Edit2 className="w-4 h-4 text-gray-700" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                Edit
              </div>
            </div>

            {/* Submit Button */}
            <div className="relative group/btn">
              <button
                onClick={handleSubmit}
                className="flex items-center justify-center w-7 h-7 bg-white/10 hover:bg-blue-300/20 rounded-full transition-colors"
              >
                <Send className="w-4 h-4 text-blue-600" />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                Submit
              </div>
            </div>
          </div>
        )}

        {/* Document Icon/Thumbnail with View Overlay */}
        <div 
          className="relative flex-shrink-0 -mt-12"
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
        >
          <div className="w-20 h-28 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-red-600/40 rounded-lg shadow-lg group/image">
            {/* <FileText className="w-10 h-10 text-red-500" /> */}
            <img 
              src={"/file.svg"} 
              alt={document.type} 
              className="absolute inset-0 w-full h-full object-contain rounded-lg opacity-100 group-hover/image:opacity-100 transition-opacity"
            />
            
            {/* View Document Overlay */}
            {isImageHovered && document.referenceNumber && (
              <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center transition-opacity">
                <div className="relative group/view">
                  <button
                    onClick={handleViewDocument}
                    className="flex items-center justify-center w-12 h-12 bg-white/90 hover:bg-white rounded-full transition-all transform hover:scale-105"
                  >
                    <ExternalLink className="w-5 h-5 text-gray-800" />
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover/view:opacity-100 transition-opacity pointer-events-none">
                    View Document
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Document Info - Only show ID, Date, Amount, Status */}
        <div className="flex flex-col justify-center gap-2 flex-1 min-w-0">
          {/* Document ID and Title */}
          <div className="flex items-start gap-2">
            <div className="min-w-0">
              <h2 className="text-black text-[12px] font-semibold leading-tight line-clamp-1">
                {document.referenceNumber} - {document.type}  
              </h2>
              
            </div>
          </div>

          {/* Metadata Row - Date, Amount, Status */}
          <div className="flex items-center gap-3 text-[10px] text-gray-600">
            {/* Date */}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{document.uploadDate}</span>
            </div>

            {/* Amount (only show if exists) */}
            {document.amount && (
              <div className="flex items-center gap-1">
                <span className="font-medium">${document.amount}</span>
              </div>
            )}

            {/* Status Pill */}
            <span className={`px-3 py-0.5 ${getStatusColor(document.status)} text-white text-[10px] rounded-full font-medium shadow-sm`}>
              {getStatusText(document.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Windows Explorer-style Tooltip */}
      {showTooltip && (document.description || document.customerNumber) && (
        <div 
          className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg shadow-xl p-3 max-w-xs pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
          }}
        >
          <div className="space-y-2">
            {/* Description */}
            {document.description && (
              <div>
                <div className="text-gray-300 text-xs font-medium mb-1">Description:</div>
                <div className="text-white text-sm leading-relaxed">{document.description}</div>
              </div>
            )}
            
            {/* Customer Number */}
            {/* {document.customerNumber && (
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-gray-300" />
                <div>
                  <div className="text-gray-300 text-xs font-medium">Customer:</div>
                  <div className="text-white text-sm">{document.customerNumber}</div>
                </div>
              </div>
            )} */}
          </div>
          
          {/* Tooltip Arrow */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-gray-900"></div>
        </div>
      )}
    </>
  );
}