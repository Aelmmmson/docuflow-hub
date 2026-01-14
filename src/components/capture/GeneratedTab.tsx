/**
 * GeneratedTab Component
 * ======================
 * Displays list of generated documents (DRAFT only) with action icons for Edit, View, Submit.
 */

import { useState } from "react";
import { FileText, Edit2, Eye, Send, AlertCircle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { SearchFilter } from "@/components/shared/SearchFilter";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RightAside } from "@/components/shared/RightAside";
import { useToast } from "@/hooks/use-toast";

export interface GeneratedDocument {
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

// Mock data - only DRAFT documents for Generated tab
const mockDocuments: GeneratedDocument[] = [
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
    referenceNumber: "1768228856",
    uploadDate: "2024-01-16",
    type: "OFFICE SUPPLIES",
    description: "Office stationery for January",
    status: "DRAFT",
    fileName: "stationery_invoice.pdf",
    amount: "350",
    customerNumber: "CUST-002",
  },
];

const documentTypes = [
  "ELECTRIC EXPENSES",
  "NEWSPAPER EXPENSE",
  "TRAVEL REIMBURSEMENT",
  "OFFICE SUPPLIES",
  "INVOICE PAYMENT",
];

interface GeneratedTabProps {
  externalDocuments?: GeneratedDocument[];
}

export function GeneratedTab({ externalDocuments }: GeneratedTabProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<GeneratedDocument[]>(
    externalDocuments ? [...externalDocuments, ...mockDocuments] : mockDocuments
  );
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Edit aside state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<GeneratedDocument | null>(null);
  const [editType, setEditType] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);

  // View aside state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<GeneratedDocument | null>(null);

  // Declined reason aside state
  const [isDeclinedOpen, setIsDeclinedOpen] = useState(false);
  const [declinedDoc, setDeclinedDoc] = useState<GeneratedDocument | null>(null);

  // Filter only DRAFT documents
  const draftDocuments = documents.filter((doc) => doc.status === "DRAFT");

  const filteredDocuments = draftDocuments.filter((doc) => {
    const matchesSearch =
      doc.referenceNumber.includes(searchValue) ||
      doc.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchValue.toLowerCase());
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleEdit = (doc: GeneratedDocument) => {
    setEditingDoc(doc);
    setEditType(doc.type);
    setEditDescription(doc.description);
    setEditFile(null);
    setIsEditOpen(true);
  };

  const handleView = (doc: GeneratedDocument) => {
    setViewingDoc(doc);
    setIsViewOpen(true);
  };

  const handleSubmit = (doc: GeneratedDocument) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id ? { ...d, status: "SUBMITTED" as const } : d
      )
    );
    toast({
      title: "Document Submitted",
      description: `${doc.referenceNumber} has been submitted for approval.`,
    });
  };

  const handleShowDeclinedReason = (doc: GeneratedDocument) => {
    setDeclinedDoc(doc);
    setIsDeclinedOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingDoc) return;

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === editingDoc.id
          ? {
              ...d,
              type: editType,
              description: editDescription,
              fileName: editFile ? editFile.name : d.fileName,
            }
          : d
      )
    );
    toast({
      title: "Document Updated",
      description: `${editingDoc.referenceNumber} has been updated.`,
    });
    setIsEditOpen(false);
  };

  const columns: Column<GeneratedDocument>[] = [
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
    { key: "description", header: "Description", hideOnMobile: true, className: "max-w-[200px] truncate text-xs" },
    {
      key: "status",
      header: "Status",
      render: (doc) => <StatusBadge status={doc.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-32",
      render: (doc) => (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            {/* Edit - available for DRAFT only */}
            {doc.status === "DRAFT" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(doc)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
            )}

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

            {/* Submit - available for DRAFT only */}
            {doc.status === "DRAFT" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary"
                    onClick={() => handleSubmit(doc)}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Submit</TooltipContent>
              </Tooltip>
            )}

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
        searchPlaceholder="Search draft documents..."
        filters={[
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
          emptyMessage="No draft documents found"
        />
      </div>

      {/* Edit Aside */}
      <RightAside
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Document"
        subtitle={editingDoc ? `Reference: ${editingDoc.referenceNumber}` : ""}
      >
        <div className="space-y-4">
          {/* Document ID (read-only) */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Document ID</Label>
            <Input
              value={editingDoc?.referenceNumber || ""}
              disabled
              className="h-9 bg-muted"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="editType" className="text-xs font-medium">
              Document Type <span className="text-destructive">*</span>
            </Label>
            <Select value={editType} onValueChange={setEditType}>
              <SelectTrigger id="editType" className="h-9">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="editDesc" className="text-xs font-medium">
              Description
            </Label>
            <Textarea
              id="editDesc"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Enter description"
              className="min-h-[80px] text-sm resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Upload New File</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              {editFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-xs">{editFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setEditFile(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Click to upload PDF
                    </span>
                  </div>
                </label>
              )}
            </div>
            {editingDoc?.fileName && !editFile && (
              <p className="text-[10px] text-muted-foreground">
                Current file: {editingDoc.fileName}
              </p>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button onClick={handleSaveEdit} className="w-full">
              Save Changes
            </Button>
          </div>
        </div>
      </RightAside>

      {/* View Aside */}
      <RightAside
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Document Details"
        subtitle={viewingDoc ? `Reference: ${viewingDoc.referenceNumber}` : ""}
      >
        {viewingDoc && (
          <div className="space-y-4">
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
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Description</Label>
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                {viewingDoc.description}
              </p>
            </div>

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
