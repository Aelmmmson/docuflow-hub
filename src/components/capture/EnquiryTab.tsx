/**
 * EnquiryTab Component
 * ====================
 * Displays ALL documents with real backend data + PDF preview in aside.
 * Updated with Code A's right aside UI design.
 */

import { useState, useEffect } from "react";
import { FileText, Eye, AlertCircle, ExternalLink, Download, X, Grid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RightAside } from "@/components/shared/RightAside";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { DocumentCard } from "./DocumentCard"; // Make sure to import DocumentCard

interface Document {
  id: string | number;
  referenceNumber: string; // doc_id
  uploadDate: string; // created_at formatted
  type: string; // doctype_name
  description: string; // details
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID";
  fileName?: string; // or file_path
  fileUrl?: string; // full URL for preview
  rejectionReason?: string;
  amount?: string;
  customerNumber?: string;
  customerDesc?: string;
  doctype_id?: string;
  doc_id?: string;
  requested_amount?: string;
  customer_no?: string;
  doctype_name?: string;
  created_at?: string;
  stage_updated_at?: string;
}

interface BackendDocument {
  id: number;
  doc_id: string;
  doctype_name: string;
  details: string;
  status: string;
  posted_by: number;
  requested_amount?: string | number;
  customer_no?: string;
  customer_desc?: string;
  created_at?: string | null;
  file_path?: string | null;
  doctype_id?: string;
  stage_updated_at?: string;
  // rejection_reason?: string;   // add if your backend returns it
}

export function EnquiryTab() {
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table"); // New state for view mode

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // View aside
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  // Declined reason aside
  const [isDeclinedOpen, setIsDeclinedOpen] = useState(false);
  const [declinedDoc, setDeclinedDoc] = useState<Document | null>(null);

  // PDF Viewer Modal state
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  const [documentTypes, setDocumentTypes] = useState([]);

  // Fetch documents
  useEffect(() => {
    if (!currentUser?.user_id) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchDocuments = async () => {
      setLoading(true);

      try {
        const userId = String(currentUser.user_id);
        const roleName = currentUser.role_name ?? "user";

        const endpoint = `/get-generated-docs/${userId}/${roleName}`;

        const res = await api.get(endpoint, {
          signal: controller.signal,
        });

        const raw: BackendDocument[] = res.data.result || [];

        const mapped = raw.map((d) => ({
          id: d.id,
          referenceNumber: d.doc_id || `REF-${d.id}`,
          uploadDate: d.created_at
            ? new Date(d.created_at).toISOString().split("T")[0]
            : d.stage_updated_at
            ? new Date(d.stage_updated_at).toISOString().split("T")[0]
            : "—",
          type: d.doctype_name || "Unknown",
          description: d.details || "",
          status: d.status as Document["status"],
          fileName: d.file_path?.split("/").pop() ?? undefined,
          fileUrl: d.file_path
            ? `${api.defaults.baseURL}/${d.file_path}`
            : undefined,
          amount: d.requested_amount ? String(d.requested_amount) : undefined,
          customerNumber: d.customer_no || undefined,
          customerDesc: d.customer_desc || undefined,
          doctype_id: d.doctype_id,
          doc_id: d.doc_id,
          requested_amount: d.requested_amount ? String(d.requested_amount) : undefined,
          customer_no: d.customer_no || undefined,
          doctype_name: d.doctype_name,
          created_at: d.created_at || undefined,
          stage_updated_at: d.stage_updated_at || undefined,
        }));

        setDocuments(mapped);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "string"
            ? err
            : "Unknown error occurred";

        console.error("Failed to load documents:", errorMessage);

        toast({
          title: "Error",
          description: errorMessage || "Could not load documents.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();

    return () => {
      controller.abort();
    };
  }, [currentUser?.user_id, currentUser?.role_name, toast]);

  //fetch document types for filter dropdown 
  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const res = await api.get("/get-doc-types");
        const types = res.data.documents || res.data.result || res.data || [];
        setDocumentTypes(types);
      } catch (err: unknown) {
        console.error("Failed to load document types:", err);
        toast({
          title: "Error",
          description: "Could not load document types.",
          variant: "destructive",
        });
      }
    };

    fetchDocTypes();
  }, [toast]);


  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.referenceNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleView = (doc: Document) => {
    console.log("Viewing document:", doc);
    setViewingDoc(doc);
    setIsViewOpen(true);
  };

  const handleShowDeclinedReason = (doc: Document) => {
    setDeclinedDoc(doc);
    setIsDeclinedOpen(true);
  };

  const handleViewDocumentInModal = (doc: Document) => {
    if (doc.referenceNumber) {
      const pdfUrl = `http://10.203.14.169/dms/filesearch-${doc.referenceNumber}`;
      setPdfUrl(pdfUrl);
      setIsPdfViewerOpen(true);
    }
  };

  const handleViewDocumentInTab = () => {
    if (viewingDoc?.referenceNumber) {
      const pdfUrl = `http://10.203.14.169/dms/filesearch-${viewingDoc.referenceNumber}`;
      window.open(pdfUrl, '_blank');
    }
  };

  const handleDownloadDocument = () => {
    if (viewingDoc?.referenceNumber) {
      const pdfUrl = `http://10.203.14.169/dms/filesearch-${viewingDoc.referenceNumber}`;
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${viewingDoc.referenceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewDocumentFromGrid = (doc: Document) => {
    console.log("Viewing document from grid:", doc);
    setViewingDoc(doc);
    setIsViewOpen(true);
  };

  const handleViewDocumentFromCard = (doc: Document) => {
    if (doc.referenceNumber) {
      const pdfUrl = `http://10.203.14.169/dms/filesearch-${doc.referenceNumber}`;
      setPdfUrl(pdfUrl);
      setIsPdfViewerOpen(true);
    }
  };

  const columns: Column<Document>[] = [
    {
      key: "id",
      header: "ID",
      className: "w-12",
      render: (_, index) => (
        <span className="text-xs text-muted-foreground">{index + 1}</span>
      ),
    },
    {
      key: "document",
      header: "Document",
      render: (doc) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
            <FileText className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <p className="text-xs font-medium">{doc.referenceNumber}</p>
            <p className="text-[10px] text-muted-foreground">
              {doc.uploadDate}
            </p>
          </div>
        </div>
      ),
    },
    { key: "referenceNumber", header: "Reference" },
    { key: "uploadDate", header: "Date" },
    { key: "type", header: "Type" },
    { key: "description", header: "Description" },
    {
      key: "status",
      header: "Status",
      render: (doc) => <StatusBadge status={doc.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-24 text-right",
      render: (doc) => (
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleView(doc)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Details</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {doc.status === "REJECTED" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleShowDeclinedReason(doc)}
            >
              <AlertCircle className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Compact Horizontal Layout - Matching Code A */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Search input on left */}
        <div className="flex-1 w-20 sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search documents..."
              className="pl-9 h-9 text-sm w-1/3"
            />
          </div>
        </div>
        
        {/* Type filter, status filter, and view toggle in one row */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Status</SelectItem>
                <SelectItem value="DRAFT" className="text-xs">Draft</SelectItem>
                <SelectItem value="SUBMITTED" className="text-xs">Submitted</SelectItem>
                <SelectItem value="APPROVED" className="text-xs">Approved</SelectItem>
                <SelectItem value="REJECTED" className="text-xs">Rejected</SelectItem>
                <SelectItem value="PAID" className="text-xs">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Type filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Type:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.description}>{type.description}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* View toggle - compact - Aligned to right */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">View:</span>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 rounded-none ${viewMode === "table" ? "bg-muted" : ""}`}
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 rounded-none ${viewMode === "grid" ? "bg-muted" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="rounded-lg border border-border">
          <DataTable
            data={filteredDocuments}
            columns={columns}
            keyExtractor={(doc) => String(doc.id)}
            emptyMessage="No documents found"
          />
        </div>
      )}


{/* Grid View */}
{viewMode === "grid" && (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {filteredDocuments.map((doc) => (
      <DocumentCard
        key={doc.id}
        document={{
          ...doc,
          id: String(doc.id),
        }}
        mode="enquiry" // Set mode to enquiry
        onView={() => handleView(doc)}
        onShowRejectionReason={doc.status === "REJECTED" ? () => handleShowDeclinedReason(doc) : undefined}
        // Add onShowApprovalDetails if you have that functionality
        onViewDocument={() => handleViewDocumentFromCard(doc)}
        // Don't pass onEdit or onSubmit for enquiry mode
      />
    ))}
  </div>
)}

      {/* View Document Aside – Updated with Code A's design */}
      <RightAside
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Document Details"
        subtitle={viewingDoc ? `Reference: ${viewingDoc.referenceNumber}` : ""}
      >
        {viewingDoc && (
          <div className="space-y-4">
            {/* Metadata in a compact grid like Code A */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Reference</span>
                <span className="text-xs font-medium">{viewingDoc.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Type</span>
                <span className="text-xs font-medium">{viewingDoc.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <StatusBadge status={viewingDoc.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Upload Date</span>
                <span className="text-xs font-medium">{viewingDoc.uploadDate}</span>
              </div>
              {viewingDoc.amount && (
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Requested Amount</span>
                  <span className="text-xs font-medium">{viewingDoc.amount}</span>
                </div>
              )}
              {viewingDoc.customerNumber && (
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Customer Number</span>
                  <span className="text-xs font-medium">{viewingDoc.customerNumber}</span>
                </div>
              )}
            </div>

            {/* Description like Code A */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Description</Label>
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                {viewingDoc.description || "No description provided."}
              </p>
            </div>

            {/* Attached Document section like Code A - FIXED button container */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Attached Document</Label>
              <div className="p-3 rounded-lg border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-destructive" />
                  <span className="text-xs flex-1 truncate">Document ID: {viewingDoc.referenceNumber}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs flex-1 min-w-0"
                    onClick={() => handleViewDocumentInModal(viewingDoc)}
                  >
                    <Eye className="h-3 w-3 mr-1 shrink-0" />
                    <span className="truncate">View in Modal</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs flex-1 min-w-0"
                    onClick={handleViewDocumentInTab}
                  >
                    <ExternalLink className="h-3 w-3 mr-1 shrink-0" />
                    <span className="truncate">View in Tab</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs flex-1 min-w-0"
                    onClick={handleDownloadDocument}
                  >
                    <Download className="h-3 w-3 mr-1 shrink-0" />
                    <span className="truncate">Download</span>
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Choose your preferred viewing option
                </p>
              </div>
            </div>

            {/* PDF Preview Section - Fixed horizontal scroll */}
            {viewingDoc.referenceNumber && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Document Preview</Label>
                <div className="border rounded-lg overflow-hidden h-[400px] bg-white relative">
                  <iframe
                    src={`http://10.203.14.169/dms/filesearch-${viewingDoc.referenceNumber}`}
                    title="Document Preview"
                    className="w-full h-full"
                    frameBorder="0"
                    style={{ overflow: "hidden" }}
                  />
                  {/* Error/Message Container - Fixed size */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                    {loading && (
                      <div className="text-center p-4 bg-white/90 rounded-lg shadow-sm">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-xs text-muted-foreground">Loading document preview...</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  If the document doesn't load, try the viewing options above
                </p>
              </div>
            )}

            {/* Rejection Reason like Code A */}
            {viewingDoc.status === "REJECTED" && viewingDoc.rejectionReason && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <Label className="text-xs font-medium text-destructive">
                  Rejection Reason
                </Label>
                <p className="mt-1 text-sm text-destructive/90 break-words">
                  {viewingDoc.rejectionReason}
                </p>
              </div>
            )}
          </div>
        )}
      </RightAside>

      {/* PDF Viewer Modal - Using Code A's modal design */}
      {isPdfViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-[90vw] max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">Document Viewer</h3>
                <p className="text-sm text-muted-foreground">View attached PDF document</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPdfViewerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <div className="border rounded-lg overflow-hidden bg-black/5 h-full">
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    title="PDF Viewer"
                    className="w-full h-full min-h-[500px]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-muted-foreground">
                    <FileText className="h-12 w-12 mb-4" />
                    <p>No document to display</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsPdfViewerOpen(false)}
              >
                Close
              </Button>
              {pdfUrl && (
                <Button
                  onClick={() => window.open(pdfUrl, '_blank')}
                >
                  Open in New Tab
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Aside - Updated to match Code A's style */}
      <RightAside
        isOpen={isDeclinedOpen}
        onClose={() => setIsDeclinedOpen(false)}
        title="Rejection Reason"
        subtitle={declinedDoc ? `Reference: ${declinedDoc.referenceNumber}` : ""}
        autoCloseAfter={15}
      >
        {declinedDoc && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
              <div>
                <p className="text-xs font-semibold text-destructive">Document Rejected</p>
                <p className="text-[10px] text-destructive/80">
                  This document was not approved
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Reason for Rejection</Label>
              <p className="text-sm text-foreground bg-muted/50 rounded-lg p-4 leading-relaxed break-words">
                {declinedDoc.rejectionReason || "No reason provided."}
              </p>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              This panel will automatically close in 15 seconds
            </p>
          </div>
        )}
      </RightAside>
    </div>
  );
}