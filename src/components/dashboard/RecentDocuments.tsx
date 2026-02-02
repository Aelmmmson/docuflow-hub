// src/components/dashboard/RecentDocuments.tsx
import { FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecentDoc } from "@/pages/Dashboard"; // import type
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // import shadcn dialog
import { Label } from "recharts";

interface RecentDocumentsProps {
  recentDocs: RecentDoc[];
}

export function RecentDocuments({ recentDocs }: RecentDocumentsProps) {
  const statusStyles: Record<string, string> = {
    SUBMITTED: "status-submitted",
    PAID: "status-paid",
    APPROVED: "status-approved",
    REJECTED: "status-rejected",
    PENDING: "status-pending",
    DRAFT: "status-pending", // fallback for DRAFT
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // 3 records per page
  const totalPages = Math.ceil(recentDocs.length / itemsPerPage);
  const paginatedDocs = recentDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [selectedDoc, setSelectedDoc] = useState<RecentDoc | null>(null);

  return (
    <div className="rounded-xl bg-card p-4 shadow-card-md animate-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-7">
        <h3 className="text-base font-bold text-card-foreground">Recent Documents</h3>
        {/* Pagination buttons in top right with reduced spacing */}
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {paginatedDocs.map((doc, index) => (
          <Dialog key={doc.id}>
            <DialogTrigger asChild>
              <div
                className="flex items-center justify-between rounded-lg bg-muted/50 p-2.5 transition-colors hover:bg-muted cursor-pointer animate-fade-in"
                style={{ animationDelay: `${300 + index * 50}ms` }}
                onClick={() => setSelectedDoc(doc)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-card-foreground">{doc.doctype_name}</p>
                    <p className="text-2xs text-muted-foreground">{doc.doc_id}</p>
                  </div>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-2xs font-medium", statusStyles[doc.status] || "status-pending")}>
                  {doc.status}
                </span>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{selectedDoc?.doctype_name} Details</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-4 max-h-96 overflow-y-auto">
                {selectedDoc && Object.entries(selectedDoc).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 items-center gap-4 border-b py-2">
                    <Label className="text-right capitalize">{key.replace(/_/g, ' ')}</Label>
                    <span className="col-span-2">{value !== null ? value.toString() : 'N/A'}</span>
                  </div>
                ))}
              </div>
              {/* View document button */}
              {selectedDoc && (
                <Button onClick={() => window.open(`/document/${selectedDoc.doc_id}`, '_blank')}>
                  View Document
                </Button>
              )}
            </DialogContent>
          </Dialog>
        ))}
        {paginatedDocs.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No recent documents</p>
        )}
      </div>
    </div>
  );
}