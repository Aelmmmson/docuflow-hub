/**
 * Finance Approvals Page
 * ======================
 * Finance-specific approval queue with table view, search, filters, and View details aside.
 * Similar to Approvals page but with finance-specific endpoints.
 */

import { ApprovalSkeleton } from "@/components/skeletons/ApprovalSkeleton";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, FileText, CheckCircle, XCircle, Search, DollarSign, Grid, List, ExternalLink, Download, X, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RightAside } from "@/components/shared/RightAside";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnquiryTab } from "@/components/capture/EnquiryTab";
import { computeAwaitingApprovers } from "@/lib/approvalUtils";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { createApprovalStampedPdf, updateDocumentFile } from "@/lib/documentStamper";
import { SigningAnimationModal } from "@/components/shared/SigningAnimationModal";
import { DocumentCard } from "../components/capture/DocumentCard";
import { GeneratedDocument } from "../components/capture/GeneratedTab";

import { formatAmount } from "@/lib/utils";

interface FinanceApprovalDocument {
  id: number;
  doc_id: string;
  created_at: string;
  details: string;
  doctype_name: string;
  approval_stage: number;
  status: "SUBMITTED" | "PAID" | "APPROVED" | "DRAFT" | "REJECTED";
  requested_amount?: string;
  customerNumber?: string;
  customerName?: string;
  posted_by?: number | string;
  doctype_id?: number | string;
  trans_type?: string;
  customer_no?: string;
  customer_desc?: string;
  finance_comments?: { comment: string; approver: string; activity_id: number; signature?: string; role_name?: string; created_at?: string }[] | string;
  documents?: [];
  amount?: string;
  // Finance-specific fields
  account_code?: string;
  payment_method?: string;
  due_date?: string;
  tax_amount?: string;
  db_account_name?: string;
  db_account?: string;
  // For DocumentCard compatibility
  referenceNumber?: string;
  uploadDate?: string;
  type?: string;
  description?: string;
}

// Format date function
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function FinanceApprovals() {
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "pending";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<FinanceApprovalDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<{id: number, description: string}[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [loadingTypes, setLoadingTypes] = useState(true);

  // View aside state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<FinanceApprovalDocument | null>(null);

  // Finance Approve dialog state
  const [isFinanceApproveOpen, setIsFinanceApproveOpen] = useState(false);
  const [financeApproveRemarks, setFinanceApproveRemarks] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [isSigningAnimating, setIsSigningAnimating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [accountCode, setAccountCode] = useState("");

  // Finance Decline dialog state
  const [isFinanceDeclineOpen, setIsFinanceDeclineOpen] = useState(false);
  const [financeDeclineRemarks, setFinanceDeclineRemarks] = useState("");

  // PDF Viewer Modal state
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.doc_id.toLowerCase().includes(searchValue.toLowerCase()) ||
      doc.details.toLowerCase().includes(searchValue.toLowerCase()) ||
      (doc.customerName && doc.customerName.toLowerCase().includes(searchValue.toLowerCase()));
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.doctype_name === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const deepDocId = searchParams.get("docId");

  const handleView = async (doc: FinanceApprovalDocument) => {
    try {
      const res = await api.get(`/get-doc/${doc.id}`);
      const commentsRes = await api.get(`/get-approval-comments/${doc.id}`).catch(() => ({ data: { comments: [] } }));
      const comments = Array.isArray(commentsRes.data?.comments) ? commentsRes.data.comments : [];

      let awaitingApprovers: { name: string; role: string; stage: number; isMandatory: boolean }[] = [];
      try {
        const setupRes = await api.get<{ setups: any[] }>("/get-approver-setups");
        const docSetup = setupRes.data?.setups?.find((s: any) => String(s.doctype_id) === String((doc as any).doctype_id));
        if (docSetup && docSetup.details) {
          awaitingApprovers = computeAwaitingApprovers(docSetup.details, Number((doc as any).approval_stage || 1), comments);
        }
      } catch (setupErr) {
        console.warn("Could not fetch awaiting approvers:", setupErr);
      }

      setViewingDoc({
        ...doc,
        db_account: res.data?.expense_details?.account_number,
        db_account_name: res.data?.expense_details?.account_name,
        approvalComments: comments,
        awaitingApprovers,
      } as any);
      setIsViewOpen(true);
    } catch (error) {
      console.error("Error fetching finance comments:", error);
      setViewingDoc(doc);
      setIsViewOpen(true);
    }
  };

  useEffect(() => {
    if (deepDocId && !isViewOpen) {
      const targetDoc = documents.find(
        (d) => d.doc_id === deepDocId || String(d.id) === deepDocId
      );
      if (targetDoc) {
        handleView(targetDoc);
      } else {
        // Fetch directly from backend API so right-aside opens immediately
        api.get(`/get-doc/${deepDocId}`)
          .then((res) => {
            const mockDoc: FinanceApprovalDocument = {
              id: Number(deepDocId) || 0,
              doc_id: deepDocId,
              doctype_name: "Finance Review",
              details: `Finance review for ${deepDocId}`,
              status: "SUBMITTED",
              approval_stage: 1,
              created_at: new Date().toISOString(),
              posted_by: "",
              db_account: res.data?.expense_details?.account_number,
              db_account_name: res.data?.expense_details?.account_name,
            };
            setViewingDoc(mockDoc);
            setIsViewOpen(true);
          })
          .catch(() => {
            setViewingDoc({
              id: 0,
              doc_id: deepDocId,
              doctype_name: "Finance Review",
              details: `Finance review for ${deepDocId}`,
              status: "SUBMITTED",
              approval_stage: 1,
              created_at: new Date().toISOString(),
              posted_by: "",
            });
            setIsViewOpen(true);
          });
      }
    }
  }, [deepDocId, documents]);

  const handleOpenFinanceApprove = () => {
    if (viewingDoc) {
      setApprovedAmount(viewingDoc.requested_amount || "");
      setPaymentMethod(viewingDoc.payment_method || "");
      setAccountCode(viewingDoc.account_code || "");
    }
    setFinanceApproveRemarks("");
    setIsFinanceApproveOpen(true);
  };

  const handleFinanceApprove = async () => {
    if (!viewingDoc) return;

    setIsSigningAnimating(true);

    const approverName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : "Finance Approver";
    const roleName = currentUser?.role_name || "Finance";
    const timestamp = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    try {
      // 1. Stamp approval block onto last page of existing PDF (WITHOUT remarks)
      const stampedPdfBase64 = await createApprovalStampedPdf({
        docId: viewingDoc.doc_id,
        numericDocId: viewingDoc.id,
        approverName,
        roleName,
        timestamp,
        signatureBase64: (currentUser as any)?.signature,
        approverUserId: currentUser?.user_id,
        approvalStage: viewingDoc.approval_stage,
      });

      // 2. Upload stamped PDF via FormData to /dms/api/update_document_api.php
      if (stampedPdfBase64) {
        await updateDocumentFile(viewingDoc.doc_id, stampedPdfBase64, `Finance approved by ${approverName}`);
      }

      // 3. Update database via backend POST /make-transaction
      const payload = {
        data: {
          docId: viewingDoc.id,
          userId: currentUser?.user_id,
          approved_amount: approvedAmount || viewingDoc.requested_amount,
          remarks: financeApproveRemarks || "",
          db_account: viewingDoc.db_account,
          cr_account: viewingDoc.customerNumber,
          customerDesc: viewingDoc.customer_desc,
          trans_type: viewingDoc.doctype_name
        }
      };

      const response = await api.post("/make-transaction", payload);

      setTimeout(() => {
        setIsSigningAnimating(false);
        if (response.data.code === "200") {
          setDocuments((prev) => prev.filter((doc) => doc.id !== viewingDoc.id));
          toast({
            title: "Document Finance Approved",
            description: `${viewingDoc.doc_id} has been signed & approved by finance.`,
          });
          setIsFinanceApproveOpen(false);
          setIsViewOpen(false);
          setViewingDoc(null);
        } else {
          toast({
            title: "Error",
            description: response.data.message || "Failed to approve document for finance",
            variant: "destructive",
          });
        }
      }, 10500);
    } catch (error) {
      console.error("Finance approval failed:", error);
      setIsSigningAnimating(false);
      toast({
        title: "Error",
        description: "Failed to approve document for finance",
        variant: "destructive",
      });
    }
  };

  const handleOpenFinanceDecline = () => {
    setFinanceDeclineRemarks("");
    setIsFinanceDeclineOpen(true);
  };

  const handleFinanceDecline = async () => {
    if (!viewingDoc) return;

    const approverName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : "Finance Approver";
    const roleName = currentUser?.role_name || "Finance";
    const timestamp = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    try {
      // 1. Stamp decline authorization card onto PDF
      const stampedPdfBase64 = await createApprovalStampedPdf({
        docId: viewingDoc.doc_id,
        numericDocId: viewingDoc.id,
        approverName,
        roleName,
        timestamp,
        signatureBase64: (currentUser as any)?.signature,
        approverUserId: currentUser?.user_id,
        approvalStage: viewingDoc.approval_stage,
        isDeclined: true,
        status: "REJECTED",
      });

      if (stampedPdfBase64) {
        await updateDocumentFile(viewingDoc.doc_id, stampedPdfBase64, `Finance declined by ${approverName}`);
      }

      // 2. Reject document in database
      const payload = {
        data: {
          docId: viewingDoc.id,
          userId: currentUser?.user_id,
          remarks: financeDeclineRemarks || "",
        }
      };

      const response = await api.put("/reject-doc", payload);
        
        if (response.data.code === "200") {
            setDocuments((prev) => prev.filter((doc) => doc.id !== viewingDoc.id));
            toast({
                  title: "Document Declined",
                  description: `${viewingDoc.doc_id} has been declined.`
            });
          setIsFinanceDeclineOpen(false);
          setIsViewOpen(false);
          setViewingDoc(null);
        };
      } catch (error) {      
        console.error("Decline failed:", error);
        toast({
          title: "Error",
          description: "Failed to decline document",
          variant: "destructive",
        });
      }
    }

  const handleViewDocumentInModal = (doc: FinanceApprovalDocument) => {
    if (doc.doc_id) {
      const pdfUrl = `http://10.203.14.169/dms/filesearch-${doc.doc_id}`;
      setPdfUrl(pdfUrl);
      setIsPdfViewerOpen(true);
    }
  };

  const handleViewDocumentInTab = () => {
    if (viewingDoc?.doc_id) {
      const pdfUrl = `http://10.203.14.169/dms/filesearch-${viewingDoc.doc_id}`;
      window.open(pdfUrl, '_blank');
    }
  };

  const handleDownloadDocument = () => {
    if (viewingDoc?.doc_id) {
      const pdfUrl = `http://10.203.14.169/dms/filesearch-${viewingDoc.doc_id}`;
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${viewingDoc.doc_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewDocumentFromGrid = (doc: FinanceApprovalDocument) => {
    setViewingDoc(doc);
    setIsViewOpen(true);
  };

  const handleViewDocumentFromCard = (doc: FinanceApprovalDocument) => {
    if (doc.doc_id) {
      const pdfUrl = `http://10.203.14.169/dms/filesearch-${doc.doc_id}`;
      setPdfUrl(pdfUrl);
      setIsPdfViewerOpen(true);
    }
  };

  // Fetch document types
  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        setLoadingTypes(true);
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
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchDocTypes();
  }, [toast]);

  // Fetch finance pending documents
  const fetchFinancePendingDocs = useCallback(async () => {
    const payload = {
      userId: currentUser?.user_id,
      role: [currentUser?.role_name]
    };
    
    try {
      const res = await api.post("/get-pending-docs", payload);
      const rawDocs = res.data.documents || res.data.financeDocuments || [];
      
      // Format documents for DocumentCard compatibility
      const formattedDocs: FinanceApprovalDocument[] = rawDocs.map((doc: {
        id: number;
        doc_id: string;
        created_at: string;
        details: string;
        doctype_name: string;
        approval_stage: number;
        status: string;
        requested_amount?: string;
        amount?: string;
        customer_no?: string;
        customerNumber?: string;
        customer_desc?: string;
        customerName?: string;
        account_code?: string;
        payment_method?: string;
        due_date?: string;
        tax_amount?: string;
      }) => ({
        ...doc,
        referenceNumber: doc.doc_id || String(doc.id),
        uploadDate: doc.created_at ? formatDate(doc.created_at) : "—",
        type: doc.doctype_name || "Unknown",
        description: doc.details || "",
        customerNumber: doc.customer_no || doc.customerNumber || undefined,
        customerDesc: doc.customer_desc || undefined,
        customerName: doc.customer_desc || doc.customerName || undefined,
        requested_amount: doc.requested_amount || doc.amount || "0",
        status: (doc.status || "SUBMITTED") as "SUBMITTED" | "PAID" | "APPROVED" | "DRAFT" | "REJECTED",
        account_code: doc.account_code,
        payment_method: doc.payment_method,
        due_date: doc.due_date,
        tax_amount: doc.tax_amount,
      }));
      
      // Sort newest first
      formattedDocs.sort((a, b) => (b.id || 0) - (a.id || 0));

      setDocuments(formattedDocs);
    } catch (err: unknown) {
      console.error("Failed to fetch finance pending documents:", err);
      toast({
        title: "Error",
        description: "Could not load finance pending documents.",
        variant: "destructive",
      });
    }
  }, [currentUser?.role_name, currentUser?.user_id, toast]);

  useEffect(() => {
    fetchFinancePendingDocs();
  }, [fetchFinancePendingDocs]);

  if (isLoading) {
    return <ApprovalSkeleton />;
  }

  return (
    <div className="p-4 lg:p-6 pt-14 lg:pt-6">
      {/* Header with Date/Time and Theme Toggle */}
      <PageHeader
        title="Finance Approvals"
        description="Review and approve pending documents for finance department"
      />

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setSearchParams({ tab: val });
        }}
        className="w-full"
      >
        <TabsList className="bg-blue-50 grid w-full grid-cols-2 lg:w-96 mb-6">
          <TabsTrigger value="pending" className="flex items-center gap-2 text-xs font-semibold">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Pending Approvals</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 text-xs font-semibold">
            <History className="w-4 h-4 text-blue-600" />
            <span>Approval History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {/* Main Card Container */}
          <div className="rounded-xl bg-card p-4 lg:p-6 shadow-card-md border border-border animate-fade-in">
            <h2 className="text-lg font-semibold text-foreground mb-4">Finance Approvals Queue</h2>

        {/* Search and Filters with View Toggle */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search by document number, description, or customer..."
                className="pl-9 h-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="w-full lg:w-48">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-10">
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

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">View:</span>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 rounded-none ${viewMode === "table" ? "bg-blue-400" : ""}`}
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 px-3 rounded-none ${viewMode === "grid" ? "bg-blue-400" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        {viewMode === "table" && (
          <div className="hidden lg:block rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue/50">
                  <TableHead className="w-16 text-xs font-semibold">ID ↓</TableHead>
                  <TableHead className="text-xs font-semibold">Document</TableHead>
                  <TableHead className="text-xs font-semibold">Description</TableHead>
                  <TableHead className="w-28 text-xs font-semibold text-center">Amount</TableHead>
                  <TableHead className="w-20 text-xs font-semibold text-center">Stage</TableHead>
                  <TableHead className="w-32 text-xs font-semibold">Status</TableHead>
                  <TableHead className="w-24 text-xs font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No finance documents found for review
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc, index) => (
                    <TableRow key={doc.id} className="hover:bg-blue/30">
                      <TableCell className="text-sm font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                            <FileText className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{doc.doc_id}</p>
                            <p className="text-xs text-muted-foreground">uploaded {formatDate(doc.created_at)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[220px] truncate" title={doc.details}>
                        <span className="truncate block max-w-[200px]">{doc.details || "—"}</span>
                      </TableCell>
                      <TableCell className="text-center font-medium text-green-600">
                        {doc.requested_amount || doc.amount || "0.00"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {doc.approval_stage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={doc.status} />
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleView(doc)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Review finance document</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredDocuments.map((doc) => {
              // Create a properly typed document for DocumentCard
              const documentCardDoc: GeneratedDocument = {
                id: String(doc.id),
                referenceNumber: doc.doc_id || String(doc.id),
                uploadDate: doc.created_at ? formatDate(doc.created_at) : "—",
                type: doc.doctype_name || "Unknown",
                description: doc.details || "",
                status: doc.status,
                amount: doc.requested_amount || doc.amount || undefined,
                customerNumber: doc.customer_no || doc.customerNumber || undefined,
                customerDesc: doc.customer_desc || undefined,
                doctype_id: String(doc.id),
                doc_id: doc.doc_id,
                requested_amount: doc.requested_amount || doc.amount || undefined,
                customer_no: doc.customer_no || doc.customerNumber || undefined,
                doctype_name: doc.doctype_name,
                created_at: doc.created_at,
                stage_updated_at: doc.created_at,
              };

              return (
                <DocumentCard
                  key={doc.id}
                  document={documentCardDoc}
                  mode="enquiry"
                  onView={() => handleViewDocumentFromGrid(doc)}
                  onViewDocument={() => handleViewDocumentFromCard(doc)}
                />
              );
            })}
          </div>
        )}

        {/* Mobile/Tablet Card View (for table mode on mobile) */}
        {viewMode === "table" && (
          <div className="lg:hidden space-y-3">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No finance documents found for review
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-xl bg-blue-100 p-4 border border-border animate-fade-in"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{doc.doc_id}</p>
                        <p className="text-xs text-muted-foreground">{doc.doctype_name}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{doc.details}</p>
                        <p className="text-sm font-medium text-green-600 mt-1">
                          ${doc.requested_amount || doc.amount || "0.00"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={doc.status} />
                      <Badge variant="secondary" className="text-xs">
                        Stage {doc.approval_stage}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleView(doc)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredDocuments.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
              ← Previous
            </Button>
            <div className="flex items-center gap-1">
              <Button size="sm" className="h-8 w-8 p-0 bg-blue-600 text-white">
                1
              </Button>
            </div>
            <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
              Next →
            </Button>
          </div>
        )}
      </div>
    </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="rounded-xl bg-card p-4 lg:p-6 shadow-card-md border border-border animate-fade-in">
            <h2 className="text-lg font-semibold text-foreground mb-4">Finance Approval & Decline History</h2>
            <EnquiryTab />
          </div>
        </TabsContent>
      </Tabs>

      {/* View Details Aside - Updated to match EnquiryTab style */}
<RightAside
  isOpen={isViewOpen}
  onClose={() => setIsViewOpen(false)}
  title="Finance Review"
  subtitle={viewingDoc ? `Reference: ${viewingDoc.doc_id}` : ""}
>
  {viewingDoc && (
    <div className="flex flex-col h-full"> {/* Changed to flex-col h-full */}
      <div className="flex-1 overflow-y-auto pb-4"> {/* Scrollable content area */}
        <div className="space-y-4">
          {/* Metadata in a compact grid like Code A */}
          <div className="rounded-lg bg-blue-100/50 p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Reference</span>
              <span className="text-xs font-medium">{viewingDoc.doc_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Type</span>
              <span className="text-xs font-medium">{viewingDoc.doctype_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <StatusBadge status={viewingDoc.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Upload Date</span>
              <span className="text-xs font-medium">{formatDate(viewingDoc.created_at)}</span>
            </div>
            {((viewingDoc as any).created_by || (viewingDoc as any).creator_name || (viewingDoc as any).posted_by) && (
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground font-semibold">Created By / Originator</span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {(viewingDoc as any).created_by || (viewingDoc as any).creator_name || `Staff ID: ${(viewingDoc as any).posted_by}`}
                </span>
              </div>
            )}
            {viewingDoc.requested_amount && (
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Requested Amount</span>
                <span className="text-xs font-medium">{formatAmount(viewingDoc.requested_amount)}</span>
              </div>
            )}
            {viewingDoc.customerNumber && (
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Customer Number</span>
                <span className="text-xs font-medium">{viewingDoc.customerNumber}</span>
              </div>
            )}
            {viewingDoc.customer_desc && (
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Customer</span>
                <span className="text-xs font-medium">{viewingDoc.customer_desc}</span>
              </div>
            )}
            {viewingDoc.db_account && (
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Debit Account</span>
                <span className="text-xs font-medium">{viewingDoc.db_account} ({viewingDoc.db_account_name})</span>
              </div>
            )}
          </div>

          {/* Description like EnquiryTab */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Description</Label>
            <p className="text-xs text-muted-foreground bg-blue-100/50 rounded-lg p-3">
              {viewingDoc.details || "No description provided."}
            </p>
          </div>

          {/* Attached Document section like EnquiryTab */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Attached Document</Label>
            <div className="p-3 rounded-lg border border-border space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-destructive" />
                <span className="text-xs flex-1 truncate">Document ID: {viewingDoc.doc_id}</span>
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

          {/* Finance-specific fields if available */}
          {viewingDoc.account_code && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Account Code</Label>
              <div className="p-3 rounded-lg bg-blue-100/30 border">
                <span className="text-xs font-medium">{viewingDoc.account_code}</span>
              </div>
            </div>
          )}

          {viewingDoc.payment_method && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Payment Method</Label>
              <div className="p-3 rounded-lg bg-blue-100/30 border">
                <span className="text-xs font-medium">{viewingDoc.payment_method}</span>
              </div>
            </div>
          )}
                {/* Finance Comments & Signatures */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Finance Audit Trail & Signatures</Label>
            <div className="space-y-2">
              {Array.isArray(viewingDoc.finance_comments) && viewingDoc.finance_comments.length > 0 ? (
                viewingDoc.finance_comments.map((comment, index) => (
                  <div 
                    key={comment.activity_id || index} 
                    className="p-3 rounded-lg border border-border bg-blue-50 dark:bg-blue-900/10 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{comment.approver}</p>
                        {comment.role_name && (
                          <span className="text-[10px] text-muted-foreground capitalize">{comment.role_name}</span>
                        )}
                      </div>
                      {comment.created_at && (
                        <span className="text-[10px] text-muted-foreground">{formatDate(comment.created_at)}</span>
                      )}
                    </div>
                    {comment.comment && (
                      <p className="text-xs text-muted-foreground">{comment.comment}</p>
                    )}
                    {comment.signature && (
                      <div className="pt-2 border-t border-border/50">
                        <span className="text-[10px] text-muted-foreground font-medium block mb-1">Approver Signature:</span>
                        <img 
                          src={comment.signature} 
                          alt={`${comment.approver}'s Signature`} 
                          className="max-h-14 max-w-[160px] object-contain rounded border border-border/60 bg-white dark:bg-slate-900 p-1 shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground p-3 rounded-lg border border-border bg-blue-100/30">
                  No finance comments available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom, full width, no horizontal scroll */}
      <div className="mt-auto border-t bg-background/5 pt-4 pb-6 w-full overflow-x-hidden">
        <div className="flex gap-3 w-full">
          <Button 
            variant="outline" 
            className="flex-1 w-0" /* w-0 allows flex-1 to work properly */
            onClick={handleOpenFinanceDecline}
          >
            Decline
          </Button>
          <Button 
            className="flex-1 w-0 bg-blue-600 hover:bg-blue-700"
            onClick={handleOpenFinanceApprove}
          >
            Finance Approve
          </Button>
        </div>
      </div>
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

      {/* Finance Approve Dialog */}
      <Dialog open={isFinanceApproveOpen} onOpenChange={setIsFinanceApproveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-10 w-10 text-emerald-500" />
              </div>
            </div>
            <DialogTitle className="text-xl">Finance Approval</DialogTitle>
            <DialogDescription>
              Review and approve document for finance processing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Approved Amount</Label>
              <Input
                placeholder="Enter approved amount"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Requested: {formatAmount(viewingDoc?.requested_amount)}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Account Code</Label>
              <Input
                placeholder="Enter account code"
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Finance Remarks (Optional)</Label>
              <Textarea
                placeholder="Enter finance remarks..."
                value={financeApproveRemarks}
                onChange={(e) => setFinanceApproveRemarks(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button variant="outline" onClick={() => setIsFinanceApproveOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleFinanceApprove} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Finance Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finance Decline Dialog */}
      <Dialog open={isFinanceDeclineOpen} onOpenChange={setIsFinanceDeclineOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <DialogTitle className="text-xl">Finance Decline</DialogTitle>
            <DialogDescription>
              Provide reason for declining this finance request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Finance Decline Reason (Required)</Label>
              <Textarea
                placeholder="Enter detailed reason for declining..."
                value={financeDeclineRemarks}
                onChange={(e) => setFinanceDeclineRemarks(e.target.value)}
                className="min-h-[120px] resize-none"
                required
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button variant="outline" onClick={() => setIsFinanceDeclineOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleFinanceDecline} 
              className="flex-1"
              disabled={!financeDeclineRemarks.trim()}
            >
              Finance Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Minimalist Signing Animation Overlay */}
      <SigningAnimationModal
        isOpen={isSigningAnimating}
        approverName={currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : "Approver"}
        roleName={currentUser?.role_name || "Finance"}
        docId={viewingDoc?.doc_id || ""}
      />
    </div>
  );
}