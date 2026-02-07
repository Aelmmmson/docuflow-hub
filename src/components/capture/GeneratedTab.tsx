/**
 * GeneratedTab Component
 * ======================
 * Displays list of generated documents (DRAFT only) with action icons for Edit, View, Submit.
 * Now integrated with real backend API.
 */

import { useState, useEffect, useCallback } from "react";
import { FileText, Edit2, Eye, Send, AlertCircle, Upload, X, Download, ExternalLink, Grid, List, Search } from "lucide-react";
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
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { FileUpload } from "./FileUpload";
import { DocumentCard } from "./DocumentCard";

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
  customerDesc?: string;
  doctype_id?: string;
  doc_id?: string;
  requested_amount?: string;
  customer_no?: string;
  doctype_name?: string;
  created_at?: string;
  stage_updated_at?: string;
  trans_type?: string; // Add trans_type to interface
}

interface DocType {
  id: number | string;
  description: string;
  trans_type?: string; // "0" or "1"
}

interface GeneratedTabProps {
  externalDocuments?: GeneratedDocument[];
}

interface BackendDocument {
  id: number;
  doctype_id: number;
  branch: string;
  requested_amount: string | null;
  approved_amount: string | null;
  customer_no: string | null;
  customer_desc: string | null;
  details: string;
  doc_id: string;
  batch_no: string | null;
  transaction_date: string | null;
  is_transaction_failed: number;
  is_approved: number;
  posted_by: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID";
  approval_stage: string;
  current_approvers: string | null;
  is_required_approvers_left: number;
  decline_reason: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  stage_updated_at: string;
  doctype_name: string;
}

// Add this interface near the top with other interfaces
interface UpdateDocumentPayload {
  doctype_id: string;
  requested_amount: string | null;
  customer_number: string | null;
  customer_desc: string;
  details: string;
  doc_id: string;
  user_id: number | undefined;
}

export function GeneratedTab({ externalDocuments }: GeneratedTabProps) {
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table"); // New state for view mode

  // Edit aside state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<GeneratedDocument | null>(null);
  const [editType, setEditType] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCustomerNumber, setEditCustomerNumber] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null);

  // View aside state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<GeneratedDocument | null>(null);

  // PDF Viewer Modal state - using a simple Dialog instead
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  // Declined reason aside state
  const [isDeclinedOpen, setIsDeclinedOpen] = useState(false);
  const [declinedDoc, setDeclinedDoc] = useState<GeneratedDocument | null>(null);

  // Fetch documents from backend
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const userId = currentUser?.user_id;
      const roleName = currentUser?.role_name || 'user';
      
      const response = await api.get(`/get-drafted-docs/${userId}/${roleName}`);
      
      if (response.data.code === "200" && response.data.result) {
        const backendDocs = response.data.result as BackendDocument[];
        const formattedDocs: GeneratedDocument[] = backendDocs.map((doc: BackendDocument) => ({
          id: doc.id.toString(),
          referenceNumber: doc.doc_id,
          uploadDate: doc.created_at ? new Date(doc.created_at).toISOString().split('T')[0] : 
                     doc.stage_updated_at ? new Date(doc.stage_updated_at).toISOString().split('T')[0] : 
                     new Date().toISOString().split('T')[0],
          type: doc.doctype_name || `Document Type ${doc.doctype_id}`,
          description: doc.details || "",
          status: doc.status || "DRAFT",
          amount: doc.requested_amount || undefined,
          customerNumber: doc.customer_no || undefined,
          customerDesc: doc.customer_desc || undefined,
          doctype_id: doc.doctype_id.toString(),
          doc_id: doc.doc_id,
          requested_amount: doc.requested_amount || undefined,
          customer_no: doc.customer_no || undefined,
          doctype_name: doc.doctype_name,
          created_at: doc.created_at || undefined,
          stage_updated_at: doc.stage_updated_at || undefined,
          // We'll need to fetch trans_type separately or get it from documentTypes
        }));
        
        setDocuments(formattedDocs);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser?.user_id, currentUser?.role_name, toast]);

  // Fetch document types
  const fetchDocumentTypes = useCallback(async () => {
    try {
      const response = await api.get("/get-doc-types");
      if (response.data.code === "200" && response.data.documents) {
        setDocumentTypes(response.data.documents);
      }
    } catch (error) {
      console.error("Error fetching document types:", error);
    }
  }, []);

  // Initial fetch - runs only once
  useEffect(() => {
    fetchDocuments();
    fetchDocumentTypes();
  }, [fetchDocuments, fetchDocumentTypes]); // Include dependencies to fix ESLint warning

  // Check if selected document type is transactional
  const isTransactionalDoc = selectedDocType?.trans_type === "1";

  // Filter only DRAFT documents
  const draftDocuments = documents.filter((doc) => doc.status === "DRAFT");

  const filteredDocuments = draftDocuments.filter((doc) => {
    const matchesSearch =
      doc.referenceNumber.includes(searchValue) ||
      doc.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchValue.toLowerCase()) ||
      (doc.customerNumber && doc.customerNumber.includes(searchValue));
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleEdit = (doc: GeneratedDocument) => {
    setEditingDoc(doc);
    const selectedType = documentTypes.find(t => t.id.toString() === doc.doctype_id);
    setSelectedDocType(selectedType || null);
    setEditType(doc.doctype_id?.toString() || "");
    setEditDescription(doc.description);
    setEditAmount(doc.amount || "");
    setEditCustomerNumber(doc.customerNumber || "");
    setEditFile(null);
    setIsEditOpen(true);
  };

  const handleDocumentTypeChange = (value: string) => {
    setEditType(value);
    const selectedType = documentTypes.find(t => t.id.toString() === value);
    setSelectedDocType(selectedType || null);
    
    // Clear amount and customer number if switching to non-transactional type
    if (selectedType?.trans_type !== "1") {
      setEditAmount("");
      setEditCustomerNumber("");
    }
  };

  const handleView = (doc: GeneratedDocument) => {
    setViewingDoc(doc);
    setIsViewOpen(true);
  };

  const handleViewDocumentInModal = (doc: GeneratedDocument) => {
    if (doc.referenceNumber) {
      const pdfUrl = `http://10.203.14.169/dms/filesearch-${doc.referenceNumber}`;
      setPdfUrl(pdfUrl);
      setIsPdfViewerOpen(true);
    }
  };

  const handleSubmit = async (doc: GeneratedDocument) => {
    try {
      const response = await api.put(`/submit-doc/${doc.id}`);
      
      if (response.data.code === "200") {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, status: "SUBMITTED" as const } : d
          )
        );
        toast({
          title: "Document Submitted",
          description: `${doc.referenceNumber} has been submitted for approval.`,
        });
      } else {
        throw new Error(response.data.result || "Submission failed");
      }
    } catch (error) {
      console.error("Error submitting document:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShowDeclinedReason = (doc: GeneratedDocument) => {
    setDeclinedDoc(doc);
    setIsDeclinedOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingDoc) return;

    try {
      setUpdating(true);
      
      // Prepare payload based on whether it's transactional
      const payload: UpdateDocumentPayload = {
        doctype_id: editType,
        details: editDescription,
        doc_id: editingDoc.referenceNumber,
        user_id: currentUser?.user_id,
        customer_desc: "",
        requested_amount: "",
        customer_number: ""
      };

      // Only include amount and customer number for transactional documents
      if (isTransactionalDoc) {
        payload.requested_amount = editAmount || null;
        payload.customer_number = editCustomerNumber || null;
      } else {
        payload.requested_amount = null;
        payload.customer_number = null;
      }

      const response = await api.put(`/update-doc/${editingDoc.id}`, payload);
      
      if (response.data.code === "200") {
        // Update local state
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === editingDoc.id
              ? {
                  ...d,
                  type: documentTypes.find(t => t.id.toString() === editType)?.description || editType,
                  description: editDescription,
                  amount: isTransactionalDoc ? editAmount : undefined,
                  customerNumber: isTransactionalDoc ? editCustomerNumber : undefined,
                  doctype_id: editType,
                }
              : d
          )
        );
        
        toast({
          title: "Document Updated",
          description: `${editingDoc.referenceNumber} has been updated.`,
        });
        setIsEditOpen(false);
      } else {
        throw new Error(response.data.result || "Update failed");
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFile = () => {
    setEditFile(null);
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setEditFile(selectedFile);
    } else if (selectedFile) {
      toast({
        title: "Invalid file",
        description: "Only PDF files are allowed.",
        variant: "destructive",
      });
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

  const handleViewDocumentFromEdit = () => {
    if (editingDoc?.referenceNumber) {
      const pdfUrl = `http://10.203.14.169/dms/filesearch-${editingDoc.referenceNumber}`;
      setPdfUrl(pdfUrl);
      setIsPdfViewerOpen(true);
    }
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
    { 
      key: "description", 
      header: "Description", 
      hideOnMobile: true, 
      className: "max-w-[200px] truncate text-xs",
      render: (doc) => (
        <div>
          <p className="truncate">{doc.description}</p>
          {doc.amount && (
            <p className="text-[10px] text-muted-foreground">Amount: {doc.amount}</p>
          )}
        </div>
      )
    },
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
              <TooltipContent>View Details</TooltipContent>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Horizontal Layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Search input on left */}
        <div className="flex-1 w-20 sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search draft documents..."
              className="pl-9 h-9 text-sm w-1/3"
            />
          </div>
        </div>
        
        {/* Type filter and view toggle in one row */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Type filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Type:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Types</SelectItem>
                {documentTypes.map((t) => (
                  <SelectItem key={t.id} value={t.description} className="text-xs">
                    {t.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* View toggle - compact */}
          <div className="flex items-center gap-2">
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
            keyExtractor={(doc) => doc.id}
            emptyMessage="No draft documents found"
          />
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
  {filteredDocuments.map((doc) => (
    <DocumentCard
      key={doc.id}
      document={doc}
      onView={() => handleView(doc)}
      onEdit={() => handleEdit(doc)}
      onSubmit={() => handleSubmit(doc)}
      onViewDocument={() => handleViewDocumentInModal(doc)}
    />
  ))}
</div>
      )}

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
            <div className="flex items-center gap-2">
              <Input
                value={editingDoc?.referenceNumber || ""}
                disabled
                className="h-9 bg-muted flex-1"
              />
              {editingDoc?.referenceNumber && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleViewDocumentFromEdit}
                  title="View Document"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="editType" className="text-xs font-medium">
              Document Type <span className="text-destructive">*</span>
            </Label>
            <Select value={editType} onValueChange={handleDocumentTypeChange}>
              <SelectTrigger id="editType" className="h-9">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    <div className="flex items-center justify-between">
                      <span>{type.description}</span>
                      {type.trans_type === "1" && (
                        <span className="text-[10px] text-muted-foreground ml-2">(Transactional)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDocType && (
              <p className="text-[10px] text-muted-foreground">
                {selectedDocType.trans_type === "1" 
                  ? "This is a transactional document" 
                  : "This is a non-transactional document"}
              </p>
            )}
          </div>

          {/* Amount - Only show for transactional documents */}
          {isTransactionalDoc && (
            <div className="space-y-2">
              <Label htmlFor="editAmount" className="text-xs font-medium">
                Requested Amount
              </Label>
              <Input
                id="editAmount"
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Enter amount"
                className="h-9"
              />
            </div>
          )}

          {/* Customer Number - Only show for transactional documents */}
          {isTransactionalDoc && (
            <div className="space-y-2">
              <Label htmlFor="editCustomerNumber" className="text-xs font-medium">
                Customer Number
              </Label>
              <Input
                id="editCustomerNumber"
                value={editCustomerNumber}
                onChange={(e) => setEditCustomerNumber(e.target.value)}
                placeholder="Enter customer number"
                className="h-9"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="editDesc" className="text-xs font-medium">
              Description <span className="text-destructive">*</span>
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
            <FileUpload
              onFileSelect={handleFileSelect}
              onRemove={handleRemoveFile}
              disabled={updating}
              documentId={editingDoc?.referenceNumber}
            />
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button 
              onClick={handleSaveEdit} 
              className="w-full"
              disabled={updating || !editType || !editDescription.trim()}
            >
              {updating ? "Saving..." : "Save Changes"}
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

            <div className="space-y-2">
              <Label className="text-xs font-medium">Description</Label>
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                {viewingDoc.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Attached Document</Label>
              <div className="p-3 rounded-lg border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-destructive" />
                  <span className="text-xs flex-1">Document ID: {viewingDoc.referenceNumber}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs flex-1"
                    onClick={() => handleViewDocumentInModal(viewingDoc)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View in Modal
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs flex-1"
                    onClick={handleViewDocumentInTab}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View in New Tab
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs flex-1"
                    onClick={handleDownloadDocument}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Choose your preferred viewing option
                </p>
              </div>
            </div>
          </div>
        )}
      </RightAside>

      {/* PDF Viewer Modal - Using a Dialog instead since RightAside doesn't have size prop */}
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