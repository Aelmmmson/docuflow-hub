/**
 * EnquiryTab Component
 * ====================
 * Displays list of document enquiries with search and filter capabilities.
 */

import { useState } from "react";
import { Search, Eye, MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ActionMenu } from "@/components/shared/ActionMenu";
import { RightAside } from "@/components/shared/RightAside";

interface Enquiry {
  id: string;
  referenceNumber: string;
  type: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  resolvedAt?: string;
  response?: string;
}

// Mock data
const mockEnquiries: Enquiry[] = [
  {
    id: "ENQ001",
    referenceNumber: "1768228851",
    type: "ELECTRIC EXPENSES",
    description: "Query about electricity bill discrepancy for January",
    status: "OPEN",
    createdAt: "2024-01-15",
  },
  {
    id: "ENQ002",
    referenceNumber: "1768228852",
    type: "TRAVEL REIMBURSEMENT",
    description: "Missing receipt clarification needed",
    status: "IN_PROGRESS",
    createdAt: "2024-01-14",
  },
  {
    id: "ENQ003",
    referenceNumber: "1768228853",
    type: "INVOICE PAYMENT",
    description: "Vendor payment confirmation request",
    status: "RESOLVED",
    createdAt: "2024-01-13",
    resolvedAt: "2024-01-14",
    response: "Payment has been processed. Transaction ID: TXN-2024-0043",
  },
  {
    id: "ENQ004",
    referenceNumber: "1768228854",
    type: "OFFICE SUPPLIES",
    description: "Budget allocation query for Q2",
    status: "CLOSED",
    createdAt: "2024-01-10",
    resolvedAt: "2024-01-12",
    response: "Q2 budget has been approved. Please submit requisitions by March 15th.",
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
  const [enquiries] = useState<Enquiry[]>(mockEnquiries);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // View aside state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingEnquiry, setViewingEnquiry] = useState<Enquiry | null>(null);

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch =
      enq.referenceNumber.includes(searchValue) ||
      enq.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      enq.type.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === "all" || enq.status === statusFilter;
    const matchesType = typeFilter === "all" || enq.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleView = (enq: Enquiry) => {
    setViewingEnquiry(enq);
    setIsViewOpen(true);
  };

  const columns: Column<Enquiry>[] = [
    {
      key: "id",
      header: "ID",
      className: "w-20 text-xs",
    },
    {
      key: "document",
      header: "Document Ref",
      render: (enq) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium">{enq.referenceNumber}</p>
            <p className="text-[10px] text-muted-foreground">{enq.createdAt}</p>
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
      render: (enq) => <StatusBadge status={enq.status.replace("_", " ")} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (enq) => (
        <ActionMenu
          actions={[
            {
              label: "View Details",
              icon: <Eye className="h-3 w-3" />,
              onClick: () => handleView(enq),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <SearchFilter
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search enquiries..."
        filters={[
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: "All Status" },
              { value: "OPEN", label: "Open" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "RESOLVED", label: "Resolved" },
              { value: "CLOSED", label: "Closed" },
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
          data={filteredEnquiries}
          columns={columns}
          keyExtractor={(enq) => enq.id}
          emptyMessage="No enquiries found"
        />
      </div>

      {/* View Aside */}
      <RightAside
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Enquiry Details"
        subtitle={viewingEnquiry ? `ID: ${viewingEnquiry.id}` : ""}
      >
        {viewingEnquiry && (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              <StatusBadge status={viewingEnquiry.status.replace("_", " ")} className="text-xs px-3 py-1" />
            </div>

            {/* Details Card */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Reference</span>
                <span className="text-xs font-medium">{viewingEnquiry.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Type</span>
                <span className="text-xs font-medium">{viewingEnquiry.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Created</span>
                <span className="text-xs font-medium">{viewingEnquiry.createdAt}</span>
              </div>
              {viewingEnquiry.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Resolved</span>
                  <span className="text-xs font-medium">{viewingEnquiry.resolvedAt}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Enquiry</Label>
              <p className="text-xs text-foreground bg-muted/50 rounded-lg p-3 leading-relaxed">
                {viewingEnquiry.description}
              </p>
            </div>

            {/* Response (if available) */}
            {viewingEnquiry.response && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Response</Label>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <p className="text-xs text-foreground leading-relaxed">
                    {viewingEnquiry.response}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </RightAside>
    </div>
  );
}
