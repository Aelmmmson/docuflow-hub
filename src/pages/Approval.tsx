/**
 * Approval Page
 * =============
 * Redesigned approval queue with table view, search, filters, and View details aside.
 * Matches the reference design with card view on mobile/tablet.
 */

import { ApprovalSkeleton } from "@/components/skeletons/ApprovalSkeleton";
import { useState, useEffect } from "react";
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

interface ApprovalDocument {
  id: number;
  referenceNumber: string;
  uploadDate: string;
  description: string;
  type: string;
  stage: number;
  status: "SUBMITTED" | "PAID" | "APPROVED";
  amount: string;
  customerNumber: string;
  customerName: string;
  approvalComments?: string;
}

const pendingDocuments: ApprovalDocument[] = [
  {
    id: 8,
    referenceNumber: "T768225558",
    uploadDate: "Jan 1st, 1970",
    description: "okay",
    type: "ELECTRIC EXPENSES",
    stage: 1,
    status: "SUBMITTED",
    amount: "200",
    customerNumber: "093827778827",
    customerName: "John Smith",
  },
  {
    id: 7,
    referenceNumber: "T745573411",
    uploadDate: "Jan 1st, 1970",
    description: "details goes here",
    type: "OFFICE SUPPLIES",
    stage: 1,
    status: "SUBMITTED",
    amount: "150",
    customerNumber: "093827778829",
    customerName: "Michael Brown",
    approvalComments: "Approved by manager",
  },
  {
    id: 6,
    referenceNumber: "T747223384",
    uploadDate: "Jan 1st, 1970",
    description: "test",
    type: "TRAVEL REIMBURSEMENT",
    stage: 2,
    status: "PAID",
    amount: "500",
    customerNumber: "093827778830",
    customerName: "Sarah Wilson",
  },
  {
    id: 4,
    referenceNumber: "T746991485",
    uploadDate: "Jan 1st, 1970",
    description: "payment details attached",
    type: "INVOICE PAYMENT",
    stage: 2,
    status: "PAID",
    amount: "1200",
    customerNumber: "093827778831",
    customerName: "Emily Davis",
  },
  {
    id: 3,
    referenceNumber: "T746632061",
    uploadDate: "Jan 1st, 1970",
    description: "PAYMENT FOR USAGE OF ELECTRICITY",
    type: "ELECTRIC EXPENSES",
    stage: 1,
    status: "PAID",
    amount: "350",
    customerNumber: "093827778832",
    customerName: "Robert Johnson",
  },
];

const documentTypes = [
  "ELECTRIC EXPENSES",
  "OFFICE SUPPLIES",
  "TRAVEL REIMBURSEMENT",
  "INVOICE PAYMENT",
];

export default function Approval() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState(pendingDocuments);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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
      doc.referenceNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleView = (doc: ApprovalDocument) => {
    setViewingDoc(doc);
    setIsViewOpen(true);
  };

  const handleOpenApprove = () => {
    setRecommendedAmount("");
    setApproveRemarks("");
    setIsApproveOpen(true);
  };

  const handleApprove = () => {
    if (!viewingDoc) return;
    
    setDocuments((prev) => prev.filter((doc) => doc.id !== viewingDoc.id));
    toast({
      title: "Document Approved",
      description: `${viewingDoc.referenceNumber} has been approved successfully.`,
    });
    setIsApproveOpen(false);
    setIsViewOpen(false);
    setViewingDoc(null);
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
      description: `${viewingDoc.referenceNumber} has been declined.`,
      variant: "destructive",
    });
    setIsDeclineOpen(false);
    setIsViewOpen(false);
    setViewingDoc(null);
  };

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
                  <SelectItem key={type} value={type}>{type}</SelectItem>
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
                <TableHead className="text-xs font-semibold">Document</TableHead>
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
                          <p className="text-sm font-medium">{doc.referenceNumber}</p>
                          <p className="text-xs text-muted-foreground">uploaded {doc.uploadDate}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {doc.description}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {doc.stage}
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
                      <p className="text-sm font-semibold">{doc.referenceNumber}</p>
                      <p className="text-xs text-muted-foreground">{doc.type}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{doc.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={doc.status} />
                    <Badge variant="secondary" className="text-xs">
                      Stage {doc.stage}
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
                  <p className="text-sm font-medium">{viewingDoc.referenceNumber}</p>
                </div>
              </div>
            </div>

            {/* Document ID */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Document ID</Label>
              <Input value={viewingDoc.referenceNumber} disabled className="bg-muted/50" />
            </div>

            {/* View Doc Button */}
            <Button className="w-full bg-primary hover:bg-primary/90">
              View Doc
            </Button>

            {/* Upload Date */}
            <p className="text-xs text-muted-foreground">uploaded {viewingDoc.uploadDate}</p>

            {/* Requested Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Requested Amount</Label>
              <Input value={viewingDoc.amount} disabled className="bg-muted/50" />
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
                value={viewingDoc.description} 
                disabled 
                className="bg-muted/50 min-h-[80px] resize-none" 
              />
            </div>

            {/* Approval Comments */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Approval Comments</Label>
              <p className="text-sm text-muted-foreground p-3 rounded-lg border border-border bg-muted/30">
                {viewingDoc.approvalComments || "No comments available"}
              </p>
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
