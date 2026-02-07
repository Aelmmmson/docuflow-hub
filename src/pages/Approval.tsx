/**
 * Approval Page
 * =============
 * Redesigned approval queue with table view, search, filters, and View details aside.
 * Matches the reference design with card view on mobile/tablet.
 */

import { ApprovalSkeleton } from "@/components/skeletons/ApprovalSkeleton";
import { useState, useEffect, useCallback } from "react";
import { Eye, FileText, CheckCircle, XCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RightAside } from "@/components/shared/RightAside";
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

interface ApprovalDocument {
  id: number;
  doc_id: string;
  created_at: string;
  details: string;
  doctype_name: string;
  approval_stage: number;
  status: "SUBMITTED" | "PAID" | "APPROVED";
  requested_amount: string;
  customerNumber: string;
  customerName: string;
  approvalComments?: [{ comment: string; approver: string; activity_id: number }] | string; // Can be an array of comments or a single string
  documents?: []; // Array of document URLs or names
}

// format date function
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  
  // Option A: Relative time (e.g., "2 hours ago", "3 days ago")
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  // Option B: Formatted date (e.g., "Feb 7, 2026")
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// const pendingDocuments: ApprovalDocument[] = [
//   {
//     id: 8,
//     doc_id: "T768225558",
//     created_at: "Jan 1st, 1970",
//     description: "okay",
//     type: "ELECTRIC EXPENSES",
//     stage: 1,
//     status: "SUBMITTED",
//     amount: "200",
//     customerNumber: "093827778827",
//     customerName: "John Smith",
//   },
//   {
//     id: 7,
//     doc_id: "T745573411",
//     created_at: "Jan 1st, 1970",
//     description: "details goes here",
//     type: "OFFICE SUPPLIES",
//     stage: 1,
//     status: "SUBMITTED",
//     amount: "150",
//     customerNumber: "093827778829",
//     customerName: "Michael Brown",
//     approvalComments: "Approved by manager",
//   },
//   {
//     id: 6,
//     doc_id: "T747223384",
//     created_at: "Jan 1st, 1970",
//     description: "test",
//     type: "TRAVEL REIMBURSEMENT",
//     stage: 2,
//     status: "PAID",
//     amount: "500",
//     customerNumber: "093827778830",
//     customerName: "Sarah Wilson",
//   },
//   {
//     id: 4,
//     doc_id: "T746991485",
//     created_at: "Jan 1st, 1970",
//     description: "payment details attached",
//     type: "INVOICE PAYMENT",
//     stage: 2,
//     status: "PAID",
//     amount: "1200",
//     customerNumber: "093827778831",
//     customerName: "Emily Davis",
//   },
//   {
//     id: 3,
//     doc_id: "T746632061",
//     created_at: "Jan 1st, 1970",
//     description: "PAYMENT FOR USAGE OF ELECTRICITY",
//     type: "ELECTRIC EXPENSES",
//     stage: 1,
//     status: "PAID",
//     amount: "350",
//     customerNumber: "093827778832",
//     customerName: "Robert Johnson",
//   },
// ];

// const documentTypes = [
//   "ELECTRIC EXPENSES",
//   "OFFICE SUPPLIES",
//   "TRAVEL REIMBURSEMENT",
//   "INVOICE PAYMENT",
// ];

 



export default function Approval() {
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<ApprovalDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loadingTypes, setLoadingTypes] = useState(true);

  // View aside state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<ApprovalDocument | null>(null);

  // Approve dialog state
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState("");
  const [recommendedAmount, setRecommendedAmount] = useState("");

  // Decline dialog state
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [declineRemarks, setDeclineRemarks] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.doc_id.toLowerCase().includes(searchValue.toLowerCase()) ||
      doc.details.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.doctype_name === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleView = async(doc: ApprovalDocument) => {

    const res = await api.get(`/get-approval-comments/${doc.id}`);
    console.log("Approval comments response:", res.data);
    
    setViewingDoc({...doc, approvalComments: res.data.comments});
    setIsViewOpen(true);
  };

  const handleOpenApprove = () => {
    setRecommendedAmount("");
    setApproveRemarks("");
    setIsApproveOpen(true);
  };

  const handleApprove = async () => {
  if (!viewingDoc) return;

  const payload = {
    data: {  // ← Add this wrapper
      docId: viewingDoc.id,
      userId: currentUser?.user_id,
      recommended_amount: recommendedAmount || null,
      requested_amount: viewingDoc.amount,
      remarks: approveRemarks || "",
      db_account: "", // Add these based on your requirements
      cr_account: viewingDoc.customerNumber,
      trans_type: viewingDoc.doctype_name,
      customerDesc: viewingDoc.customerName
    }
  };

  try {
    const response = await api.put("/approve-doc", payload);
    
    if (response.data.code === "200") {
      setDocuments((prev) => prev.filter((doc) => doc.id !== viewingDoc.id));
      toast({
        title: "Document Approved",
        description: `${viewingDoc.doc_id} has been approved successfully.`,
      });
      setIsApproveOpen(false);
      setIsViewOpen(false);
      setViewingDoc(null);
    }
  } catch (error) {
    console.error("Approval failed:", error);
    toast({
      title: "Error",
      description: "Failed to approve document",
      variant: "destructive",
    });
  }
};

  const handleOpenDecline = () => {
    setDeclineRemarks("");
    setIsDeclineOpen(true);
  };

  const handleDecline = () => {
    if (!viewingDoc) return;

    setDocuments((prev) => prev.filter((doc) => doc.id !== viewingDoc.id));
    toast({
      title: "Document Declined",
      description: `${viewingDoc.doc_id} has been declined.`,
      variant: "destructive",
    });
    setIsDeclineOpen(false);
    setIsViewOpen(false);
    setViewingDoc(null);
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

  // Fetch approval setups – wrapped in useCallback to stabilize reference
  const fetchPendingDocs = useCallback(async () => {
    const payload = {
      userId : currentUser?.user_id,
      role: [currentUser?.role_name]
    }
    try {
      const res = await api.post<{ pendingDocuments: ApprovalDocument[] }>("/get-pending-docs", payload);
      setDocuments(res.data.documents);
    } catch (err: unknown) {
      console.error("Failed to fetch pending documents:", err);
      toast({
        title: "Error",
        description: "Could not load pending documents.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchPendingDocs();
  }, [fetchPendingDocs]);

  if (isLoading) {
    return <ApprovalSkeleton />;
  }

  return (
    <div className="p-4 lg:p-6 pt-14 lg:pt-6">
      {/* Header with Date/Time and Theme Toggle */}
      <PageHeader
        title="Approvals"
        description="Review and approve pending documents"
      />

      {/* Main Card Container */}
      <div className="rounded-xl bg-card p-4 lg:p-6 shadow-card-md border border-border animate-fade-in">
        <h2 className="text-lg font-semibold text-foreground mb-4">Approvals</h2>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Search for documents</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search by document number or description..."
                className="pl-9 h-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-40">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Status</Label>
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
          <div className="w-full lg:w-40">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Document Type</Label>
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
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16 text-xs font-semibold">ID ↓</TableHead>
                <TableHead className="text-xs font-semibold">Document </TableHead>
                <TableHead className="text-xs font-semibold">Description</TableHead>
                <TableHead className="w-20 text-xs font-semibold text-center">Stage</TableHead>
                <TableHead className="w-28 text-xs font-semibold">Status</TableHead>
                <TableHead className="w-24 text-xs font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm font-medium">{doc.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                          <FileText className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.doc_id}</p>
                          <p className="text-xs text-muted-foreground">uploaded {formatDate(doc.created_at)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {doc.details}
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
                              className="bg-primary hover:bg-primary/90"
                              onClick={() => handleView(doc)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View document details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-3">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents found
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl bg-muted/30 p-4 border border-border animate-fade-in"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 shrink-0">
                      <FileText className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{doc.doc_id}</p>
                      <p className="text-xs text-muted-foreground">{doc.doctype_name}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{doc.details}</p>
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
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => handleView(doc)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredDocuments.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
              ← Previous
            </Button>
            <div className="flex items-center gap-1">
              <Button size="sm" className="h-8 w-8 p-0 bg-primary text-primary-foreground">
                1
              </Button>
            </div>
            <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
              Next →
            </Button>
          </div>
        )}
      </div>

      {/* View Details Aside */}
      <RightAside
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="View Details"
        width="md"
      >
        {viewingDoc && (
          <div className="space-y-4">
            {/* Document Information */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground">Document Information</Label>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <FileText className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Document</p>
                  <p className="text-sm font-medium">{viewingDoc.doc_id}</p>
                </div>
              </div>
            </div>

            {/* Document ID */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Document ID</Label>
              <Input value={viewingDoc.doc_id} disabled className="bg-muted/50" />
            </div>

            {/* View Doc Button */}
            <Button className="w-full bg-primary hover:bg-primary/90">
              View Doc
            </Button>

            {/* Upload Date */}
            <p className="text-xs text-muted-foreground">uploaded {formatDate(viewingDoc.created_at)}</p>

            {/* Requested Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Requested Amount</Label>
              <Input value={viewingDoc.requested_amount} disabled className="bg-muted/50" />
            </div>

            {/* Customer Number */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Customer number</Label>
              <div className="flex gap-2">
                <Input 
                  value={`${viewingDoc.customerNumber} - ${viewingDoc.customerName}`} 
                  disabled 
                  className="bg-muted/50 flex-1" 
                />
                <Button size="sm" className="shrink-0 bg-primary hover:bg-primary/90">
                  SEARCH
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Details</Label>
              <Textarea 
                value={viewingDoc.details} 
                disabled 
                className="bg-muted/50 min-h-[80px] resize-none" 
              />
            </div>

            {/* Approval Comments */}
            {/* Approval Comments */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Approval Comments</Label>
              <div className="space-y-2">
                {Array.isArray(viewingDoc.approvalComments) && viewingDoc.approvalComments.length > 0 ? (
                  viewingDoc.approvalComments.map((comment, index) => (
                    <div 
                      key={comment.activity_id || index} 
                      className="p-3 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-medium text-foreground">{comment.approver}</p>
                        {/* <Badge variant="secondary" className="text-xs">#{comment.activity_id}</Badge> */}
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground p-3 rounded-lg border border-border bg-muted/30">
                    No comments available
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 sticky bottom-0 bg-background pb-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleOpenDecline}
              >
                Decline
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleOpenApprove}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </RightAside>

      {/* Approve Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
            </div>
            <DialogTitle className="text-xl">Approve Request</DialogTitle>
            <DialogDescription>
              Optionally add a recommended amount and remarks before approving
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Recommended Amount (Optional)</Label>
              <Input
                placeholder="Enter amount"
                value={recommendedAmount}
                onChange={(e) => setRecommendedAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Remarks (Optional)</Label>
              <Textarea
                placeholder="Enter your remarks..."
                value={approveRemarks}
                onChange={(e) => setApproveRemarks(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button variant="outline" onClick={() => setIsApproveOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleApprove} className="flex-1 bg-primary hover:bg-primary/90">
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={isDeclineOpen} onOpenChange={setIsDeclineOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <DialogTitle className="text-xl">Decline Request</DialogTitle>
            <DialogDescription>
              Optionally add remarks explaining why this request is being declined
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Remarks (Optional)</Label>
              <Textarea
                placeholder="Enter your remarks..."
                value={declineRemarks}
                onChange={(e) => setDeclineRemarks(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button variant="outline" onClick={() => setIsDeclineOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDecline} className="flex-1">
              Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
