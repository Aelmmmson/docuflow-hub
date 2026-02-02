/**
 * EnquiryTab Component
 * ====================
 * Displays ALL documents with real backend data + PDF preview in aside.
 */

import { useState, useEffect } from "react";
import { FileText, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

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
  created_at?: string | null;
  file_path?: string | null;
  // rejection_reason?: string;   // add if your backend returns it
}

export function EnquiryTab() {
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // View aside
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  // Declined reason aside
  const [isDeclinedOpen, setIsDeclinedOpen] = useState(false);
  const [declinedDoc, setDeclinedDoc] = useState<Document | null>(null);

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
      <div className="flex items-center justify-between">
        <SearchFilter
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search documents..."
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
                // You can fetch real types dynamically later
                { value: "ELECTRIC EXPENSES", label: "Electric Expenses" },
                { value: "NEWSPAPER EXPENSE", label: "Newspaper Expense" },
                // ...
              ],
            },
          ]}
        />
      </div>

      <div className="rounded-lg border bg-card">
        <DataTable
          data={filteredDocuments}
          columns={columns}
          keyExtractor={(doc) => String(doc.id)}
          emptyMessage={loading ? "Loading documents..." : "No documents found"}
          isLoading={loading}
        />
      </div>

      {/* View Document Aside – now with PDF preview */}
      <RightAside
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Document Details"
        subtitle={viewingDoc ? `Ref: ${viewingDoc.referenceNumber}` : ""}
      >
        {viewingDoc && (
          <div className="space-y-6">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Reference
                </Label>
                <p className="font-medium">{viewingDoc.referenceNumber}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <p className="font-medium">{viewingDoc.type}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date</Label>
                <p className="font-medium">{viewingDoc.uploadDate}</p>
              </div>
              {viewingDoc.amount && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Amount
                  </Label>
                  <p className="font-medium">${viewingDoc.amount}</p>
                </div>
              )}
              {viewingDoc.customerNumber && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Customer
                  </Label>
                  <p className="font-medium">{viewingDoc.customerNumber}</p>
                </div>
              )}
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <StatusBadge status={viewingDoc.status} />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="text-xs font-medium">Description</Label>
              <p className="mt-1 text-sm bg-muted/50 p-3 rounded border">
                {viewingDoc.description || "No description provided."}
              </p>
            </div>

            {/* PDF Preview / File */}
            {viewingDoc.fileUrl ? (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Document Preview</Label>
                <div className="border rounded-lg overflow-hidden h-[500px] bg-white">
                  <iframe
                    src={viewingDoc.fileUrl}
                    title="Document Preview"
                    className="w-full h-full"
                    frameBorder="0"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={viewingDoc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in new tab
                    </a>
                  </Button>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            ) : viewingDoc.fileName ? (
              <div className="p-4 border rounded-lg bg-muted/30 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm">{viewingDoc.fileName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  File preview not available
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No file attached
              </p>
            )}

            {/* Rejection Reason */}
            {viewingDoc.status === "REJECTED" && viewingDoc.rejectionReason && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <Label className="text-xs font-medium text-destructive">
                  Rejection Reason
                </Label>
                <p className="mt-1 text-sm text-destructive/90">
                  {viewingDoc.rejectionReason}
                </p>
              </div>
            )}
          </div>
        )}
      </RightAside>

      {/* Rejection Reason Aside (unchanged) */}
      <RightAside
        isOpen={isDeclinedOpen}
        onClose={() => setIsDeclinedOpen(false)}
        title="Rejection Reason"
        subtitle={declinedDoc ? `Ref: ${declinedDoc.referenceNumber}` : ""}
        autoCloseAfter={15}
      >
        {declinedDoc && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
              <div>
                <p className="text-xs font-semibold text-destructive">
                  Document Rejected
                </p>
                <p className="text-[10px] text-destructive/80">
                  This document was not approved
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Reason for Rejection
              </Label>
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
