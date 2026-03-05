// src/components/dashboard/RecentDocuments.tsx
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Calendar,
  User,
  Hash,
  Building,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  TrendingUp,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecentDoc } from "@/pages/Dashboard";
import { Button } from "@/components/ui/button";
import { useState, ElementType, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface RecentDocumentsProps {
  recentDocs?: RecentDoc[];
}

export function RecentDocuments({ recentDocs = [] }: RecentDocumentsProps) {
  const statusStyles: Record<string, { bg: string; text: string; icon: ReactNode }> = {
    SUBMITTED: { bg: "bg-blue-500/10", text: "text-blue-600", icon: <FileText className="h-3 w-3" /> },
    PAID: { bg: "bg-emerald-500/10", text: "text-emerald-600", icon: <CheckCircle2 className="h-3 w-3" /> },
    APPROVED: { bg: "bg-emerald-500/10", text: "text-emerald-600", icon: <CheckCircle2 className="h-3 w-3" /> },
    REJECTED: { bg: "bg-destructive/10", text: "text-destructive", icon: <X className="h-3 w-3" /> },
    PENDING: { bg: "bg-amber-500/10", text: "text-amber-600", icon: <Clock className="h-3 w-3" /> },
    DRAFT: { bg: "bg-slate-500/10", text: "text-slate-600", icon: <FileText className="h-3 w-3" /> },
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(recentDocs.length / itemsPerPage);
  const paginatedDocs = recentDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [selectedDoc, setSelectedDoc] = useState<RecentDoc | null>(null);

  const getStatusStyle = (status: string) => statusStyles[status] || statusStyles.PENDING;

  const DetailItem = ({ label, value, icon: Icon }: { label: string; value: string | null | number; icon: ElementType }) => (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-1.5 text-2xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="text-sm font-medium text-foreground truncate" title={String(value)}>
        {value || "N/A"}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl bg-card p-4 shadow-card-md animate-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-7">
        <h3 className="text-base font-bold text-card-foreground">Recent Documents</h3>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="h-8 w-8">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="h-8 w-8">
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {paginatedDocs.map((doc, index) => (
          <Dialog key={doc.id}>
            <DialogTrigger asChild>
              <div
                className="flex items-center justify-between rounded-lg bg-muted/50 p-2.5 transition-all hover:bg-muted cursor-pointer animate-fade-in group border border-transparent hover:border-primary/20"
                style={{ animationDelay: `${300 + index * 50}ms` }}
                onClick={() => setSelectedDoc(doc)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-card-foreground line-clamp-1">{doc.doctype_name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Hash className="h-3 w-3" /> {doc.doc_id}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1",
                    getStatusStyle(doc.status).bg,
                    getStatusStyle(doc.status).text
                  )}>
                    {getStatusStyle(doc.status).icon}
                    {doc.status}
                  </span>
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </DialogTrigger>

            {/* 
              Fix: High z-index [100] to ensure modal is above the Dashboard date filter bar (z-[60]).
              We use a max-width optimized for both details and preview.
            */}
            <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0 z-[100]">
              <div className="p-6 border-b bg-muted/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold">Document Details</DialogTitle>
                      <p className="text-sm text-muted-foreground font-medium">{selectedDoc?.doctype_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedDoc && (
                      <Badge variant="outline" className={cn("text-xs px-3 py-1", getStatusStyle(selectedDoc.status).bg, getStatusStyle(selectedDoc.status).text)}>
                        {selectedDoc.status}
                      </Badge>
                    )}
                    <Button
                      onClick={() => window.open(`http://10.203.14.169/dms/filesearch-${selectedDoc?.doc_id}`, '_blank')}
                      variant="outline"
                      size="sm"
                      className="gap-2 h-9"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Full File
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                  {/* Left Section: Details */}
                  <div className="p-6 space-y-6 lg:border-r">
                    <section>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        General Information
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <DetailItem label="Document ID" value={selectedDoc?.doc_id} icon={Hash} />
                        <DetailItem label="Branch" value={selectedDoc?.branch} icon={Building} />
                        <DetailItem label="Posted By" value={selectedDoc?.posted_by} icon={User} />
                        <DetailItem label="Created At" value={selectedDoc?.created_at ? new Date(selectedDoc.created_at).toLocaleString() : null} icon={Calendar} />
                      </div>
                    </section>

                    <section>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Financial Details
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <DetailItem label="Requested Amount" value={selectedDoc?.requested_amount ? `$${Number(selectedDoc.requested_amount).toLocaleString()}` : null} icon={DollarSign} />
                        <DetailItem label="Approved Amount" value={selectedDoc?.approved_amount ? `$${Number(selectedDoc.approved_amount).toLocaleString()}` : "$0.00"} icon={CheckCircle2} />
                        <DetailItem label="Customer No" value={selectedDoc?.customer_no} icon={Hash} />
                        <DetailItem label="Approval Stage" value={selectedDoc?.approval_stage} icon={TrendingUp} />
                      </div>
                    </section>

                    <section>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description & Details
                      </h4>
                      <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-sm text-foreground leading-relaxed">
                        <p className="font-semibold mb-1 text-xs text-muted-foreground">Customer Description:</p>
                        <p className="mb-4">{selectedDoc?.customer_desc || "No description provided"}</p>
                        <p className="font-semibold mb-1 text-xs text-muted-foreground">Detailed Notes:</p>
                        <p className="whitespace-pre-wrap">{selectedDoc?.details || "No details available"}</p>
                      </div>
                    </section>

                    {selectedDoc?.decline_reason && (
                      <section className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive">
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Decline Reason
                        </h4>
                        <p className="text-sm font-medium">{selectedDoc.decline_reason}</p>
                      </section>
                    )}
                  </div>

                  {/* Right Section: PDF Preview */}
                  <div className="bg-muted flex flex-col h-[500px] lg:h-auto overflow-hidden">
                    <div className="p-4 border-b bg-background flex items-center justify-between shrink-0">
                      <span className="text-xs font-bold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        PDF Preview
                      </span>
                    </div>
                    <div className="flex-1 bg-muted/50 p-4">
                      {selectedDoc ? (
                        <iframe
                          src={`http://10.203.14.169/dms/filesearch-${selectedDoc.doc_id}`}
                          className="w-full h-full rounded-md shadow-sm border bg-white"
                          title="Document Preview"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                          <FileText className="h-12 w-12 mb-2" />
                          <p className="text-sm">No preview available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
        {paginatedDocs.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10 italic">No recent documents found for this period</p>
        )}
      </div>
    </div>
  );
}
