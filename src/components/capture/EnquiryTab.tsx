/**
 * EnquiryTab Component
 * ====================
 * Displays ALL documents (not just drafts) with search and filter capabilities.
 */

import { useState } from "react";
import { FileText, Eye, Edit2, Send, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RightAside } from "@/components/shared/RightAside";

interface Document {
  id: string;
  referenceNumber: string;
  uploadDate: string;
  type: string;
  description: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID";
  fileName?: string;
  rejectionReason?: string;
  amount?: string;
  customerNumber?: string;
}

// Mock data - ALL documents for Enquiry tab
const mockDocuments: Document[] = [
  {
    id: "1",
    referenceNumber: "1768228851",
    uploadDate: "2024-01-15",
    type: "ELECTRIC EXPENSES",
    description: "Monthly electricity bill for HQ building",
    status: "DRAFT",
    fileName: "electric_bill_jan.pdf",
    amount: "2500",
    customerNumber: "CUST-001",
  },
  {
    id: "2",
    referenceNumber: "1768228852",
    uploadDate: "2024-01-14",
    type: "NEWSPAPER EXPENSE",
    description: "Daily newspaper subscription Q1",
    status: "SUBMITTED",
    fileName: "newspaper_invoice.pdf",
    amount: "150",
    customerNumber: "CUST-002",
  },
  {
    id: "3",
    referenceNumber: "1768228853",
    uploadDate: "2024-01-13",
    type: "TRAVEL REIMBURSEMENT",
    description: "Business trip to Lagos - client meeting",
    status: "APPROVED",
    fileName: "travel_receipts.pdf",
    amount: "5000",
    customerNumber: "CUST-003",
  },
  {
    id: "4",
    referenceNumber: "1768228854",
    uploadDate: "2024-01-12",
    type: "OFFICE SUPPLIES",
    description: "Stationery purchase for Q1",
    status: "REJECTED",
    fileName: "office_supplies.pdf",
    rejectionReason: "Missing itemized receipt. Please provide detailed breakdown of all items purchased.",
    amount: "350",
    customerNumber: "CUST-004",
  },
  {
    id: "5",
    referenceNumber: "1768228855",
    uploadDate: "2024-01-11",
    type: "INVOICE PAYMENT",
    description: "Vendor payment - IT services",
    status: "PAID",
    fileName: "it_services_invoice.pdf",
    amount: "12000",
    customerNumber: "CUST-005",
  },
];

const documentTypes = [
  "ELECTRIC EXPENSES",
  "NEWSPAPER EXPENSE",
  "TRAVEL REIMBURSEMENT",
  "OFFICE SUPPLIES",
  "INVOICE PAYMENT",
];

export function EnquiryTab() {
  const [documents] = useState<Document[]>(mockDocuments);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // View aside state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  // Declined reason aside state
  const [isDeclinedOpen, setIsDeclinedOpen] = useState(false);
  const [declinedDoc, setDeclinedDoc] = useState<Document | null>(null);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.referenceNumber.includes(searchValue) ||
      doc.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleView = (doc: Document) => {
    setViewingDoc(doc);
    setIsViewOpen(true);
  };

  const handleShowDeclinedReason = (doc: Document) => {
    setDeclinedDoc(doc);
    setIsDeclinedOpen(true);
  };

  const columns: Column<Document>[] = [
    {
      key: "id",
      header: "ID",
      className: "w-12",
      render: (_, index) => <span className="text-xs text-muted-foreground">{index + 1}</span>,
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
            <p className="text-[10px] text-muted-foreground">{doc.uploadDate}</p>
          </div>
        </div>
      ),
    },
    { key: "type", header: "Type", className: "text-xs" },
    {
      key: "description",
      header: "Description",
      hideOnMobile: true,
      className: "max-w-[200px] truncate text-xs",
    },
    {
      key: "status",
      header: "Status",
      render: (doc) => <StatusBadge status={doc.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (doc) => (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            {/* View - always available */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleView(doc)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>

            {/* Declined Reason - available for REJECTED only */}
            {doc.status === "REJECTED" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleShowDeclinedReason(doc)}
                  >
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Declined Reason</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <SearchFilter
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search all documents..."
        filters={[
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: "All Status" },
              { value: "DRAFT", label: "Draft" },
              { value: "SUBMITTED", label: "Submitted" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
              { value: "PAID", label: "Paid" },
            ],
          },
          {
            key: "type",
            label: "Type",
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { value: "all", label: "All Types" },
              ...documentTypes.map((t) => ({ value: t, label: t })),
            ],
          },
        ]}
      />

      {/* Data Table */}
      <div className="rounded-lg border border-border">
        <DataTable
          data={filteredDocuments}
          columns={columns}
          keyExtractor={(doc) => doc.id}
          emptyMessage="No documents found"
        />
      </div>

      {/* View Aside */}
      <RightAside
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Document Details"
        subtitle={viewingDoc ? `Reference: ${viewingDoc.referenceNumber}` : ""}
      >
        {viewingDoc && (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              <StatusBadge status={viewingDoc.status} className="text-xs px-3 py-1" />
            </div>

            {/* Details Card */}
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
                <span className="text-xs text-muted-foreground">Upload Date</span>
                <span className="text-xs font-medium">{viewingDoc.uploadDate}</span>
              </div>
              {viewingDoc.amount && (
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <span className="text-xs font-medium">${viewingDoc.amount}</span>
                </div>
              )}
              {viewingDoc.customerNumber && (
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Customer</span>
                  <span className="text-xs font-medium">{viewingDoc.customerNumber}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Description</Label>
              <p className="text-xs text-foreground bg-muted/50 rounded-lg p-3 leading-relaxed">
                {viewingDoc.description}
              </p>
            </div>

            {/* Attached File */}
            {viewingDoc.fileName && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Attached File</Label>
                <div className="flex items-center gap-2 p-3 rounded-lg border border-border">
                  <FileText className="h-5 w-5 text-destructive" />
                  <span className="text-xs flex-1">{viewingDoc.fileName}</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Download
                  </Button>
                </div>
              </div>
            )}

            {/* Rejection Reason (if applicable) */}
            {viewingDoc.status === "REJECTED" && viewingDoc.rejectionReason && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-destructive">Rejection Reason</Label>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-xs text-destructive leading-relaxed">
                    {viewingDoc.rejectionReason}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </RightAside>

      {/* Declined Reason Aside (auto-close after 15s) */}
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
              <p className="text-sm text-foreground bg-muted/50 rounded-lg p-4 leading-relaxed">
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
