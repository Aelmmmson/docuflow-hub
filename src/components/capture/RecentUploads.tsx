import { FileText, Eye } from "lucide-react";
import { useState } from "react";
import { RightAside } from "@/components/shared/RightAside";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface RecentFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
  status: string;
  description: string;
}

const recentFiles: RecentFile[] = [
  { 
    id: "1",
    name: "Invoice_2024_001.pdf", 
    size: "245 KB",
    uploadDate: "2024-01-15",
    type: "Invoice",
    status: "DRAFT",
    description: "Monthly invoice for January services",
  },
  { 
    id: "2",
    name: "Receipt_March.pdf", 
    size: "128 KB",
    uploadDate: "2024-01-14",
    type: "Receipt",
    status: "SUBMITTED",
    description: "March expense receipts compilation",
  },
  { 
    id: "3",
    name: "Contract_Draft.pdf", 
    size: "512 KB",
    uploadDate: "2024-01-13",
    type: "Contract",
    status: "APPROVED",
    description: "Draft contract for new vendor agreement",
  },
  { 
    id: "4",
    name: "Expense_Report.pdf", 
    size: "89 KB",
    uploadDate: "2024-01-12",
    type: "Expense",
    status: "PAID",
    description: "Q4 expense report summary",
  },
];

export function RecentUploads() {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<RecentFile | null>(null);

  const handleViewFile = (file: RecentFile) => {
    setViewingFile(file);
    setIsViewOpen(true);
  };

  return (
    <>
      <div className="rounded-xl bg-card p-4 shadow-card-md border border-border">
        <h3 className="text-xs font-semibold text-card-foreground mb-3">Recent Documents</h3>
        <div className="space-y-2">
          {recentFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => handleViewFile(file)}
              className="flex w-full items-center gap-2.5 rounded-lg p-2 transition-all hover:bg-muted hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                <FileText className="h-4 w-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-card-foreground truncate">{file.name}</p>
                <p className="text-2xs text-muted-foreground">{file.size}</p>
              </div>
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* View Document Aside */}
      <RightAside
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Document Preview"
        subtitle={viewingFile?.name || ""}
      >
        {viewingFile && (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              <StatusBadge status={viewingFile.status} className="text-xs px-3 py-1" />
            </div>

            {/* Document Info */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">File Name</span>
                <span className="text-xs font-medium">{viewingFile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Size</span>
                <span className="text-xs font-medium">{viewingFile.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Type</span>
                <span className="text-xs font-medium">{viewingFile.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Upload Date</span>
                <span className="text-xs font-medium">{viewingFile.uploadDate}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Description</Label>
              <p className="text-xs text-foreground bg-muted/50 rounded-lg p-3 leading-relaxed">
                {viewingFile.description}
              </p>
            </div>

            {/* File Preview Placeholder */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">File</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border">
                <FileText className="h-5 w-5 text-destructive" />
                <span className="text-xs flex-1">{viewingFile.name}</span>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}
      </RightAside>
    </>
  );
}
