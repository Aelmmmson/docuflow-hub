/**
 * DocumentForm Component - Capture & Upload Documents
 */

import { useState, useEffect } from "react";
import { Search, FileText, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { FileUpload } from "./FileUpload";

interface DocType {
  id: number | string;
  description: string;
  trans_type?: string; // "0" or "1"
}

interface Template {
  documentType?: string;
  defaultDescription?: string;
}

interface DocumentFormProps {
  selectedTemplate?: Template | null;
  onClearTemplate?: () => void;
  onDocumentSubmit?: (doc: unknown) => void;
}

// Define proper interface for the generate document payload
interface GenerateDocumentPayload {
  doctype_id: string;
  requested_amount: string | null;
  customer_number: string | null;
  customer_desc: string;
  details: string;
  doc_id: string;
  user_id: number | undefined;
}

export function DocumentForm({ selectedTemplate, onClearTemplate, onDocumentSubmit }: DocumentFormProps) {
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const [documentTypes, setDocumentTypes] = useState<DocType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null);

  const [documentType, setDocumentType] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [amount, setAmount] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [details, setDetails] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Check if selected document type is transactional
  const isTransactionalDoc = selectedDocType?.trans_type === "1";

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

  // Apply template
  useEffect(() => {
    if (selectedTemplate) {
      const templateType = selectedTemplate.documentType || "";
      setDocumentType(templateType);
      
      // Find and set the selected document type for transactional check
      const selectedType = documentTypes.find(t => t.id.toString() === templateType);
      if (selectedType) {
        setSelectedDocType(selectedType);
      }
      
      setDetails(selectedTemplate.defaultDescription || "");
    }
  }, [selectedTemplate, documentTypes]);

  // Handle document type change
  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value);
    const selectedType = documentTypes.find(t => t.id.toString() === value);
    setSelectedDocType(selectedType || null);
    
    // Clear amount and customer number if switching to non-transactional type
    if (selectedType?.trans_type !== "1") {
      setAmount("");
      setCustomerNumber("");
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      
      // Only show preview modal if we haven't uploaded yet
      if (!documentId) {
        setShowPreviewModal(true);
      }
      
      setUploadProgress(0);
    } else if (selectedFile) {
      toast({
        title: "Invalid file",
        description: "Only PDF files are allowed.",
        variant: "destructive",
      });
    } else {
      // Handle file removal
      setFile(null);
    }
  };

  const handleViewFile = () => {
    if (documentId) {
      // Directly open the PDF in new tab using the correct URL pattern
      const pdfUrl = `http://10.203.14.169/dms/filesearch-${documentId}`;
      window.open(pdfUrl, '_blank');
    } else if (file) {
      // Show preview modal for local file before upload
      setShowPreviewModal(true);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setDocumentId("");
    toast({
      title: "File Removed",
      description: "You can now upload a new file.",
    });
  };

  const handleUploadConfirm = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("branch", "000");
      formData.append("scanned_by", currentUser?.first_name || "Unknown User");
      formData.append("doc_type_value", "1");
      formData.append("descrip", details.trim() || "Generated Document");
      formData.append("businessdate", new Date().toISOString().split("T")[0]);

      const response = await api.post(
        "http://10.203.14.169/dms/scan/insert_doc_api.php",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percent);
            }
          },
        }
      );

      const uploadResult = response.data as { error: number; token?: string; message?: string };

      if (uploadResult.error !== 0) {
        throw new Error(uploadResult.message || "Upload failed on server");
      }

      const returnedDocId = uploadResult.token || "";
      if (!returnedDocId) {
        throw new Error("No token/document ID returned from server");
      }

      setDocumentId(returnedDocId);
      
      toast({
        title: "Upload Successful",
        description: `Document ID: ${returnedDocId}`,
      });

      // Close modal immediately
      setShowPreviewModal(false);
      setUploading(false);
      setUploadProgress(0);

    } catch (err: unknown) {
      console.error("Upload failed:", err);

      let message = "Please try again.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        message = axiosErr.response?.data?.message || message;
      }

      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
      
      setUploading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!documentType) {
      toast({ title: "Error", description: "Document type is required.", variant: "destructive" });
      return;
    }
    if (!documentId) {
      toast({ title: "Error", description: "Please upload document first to get ID.", variant: "destructive" });
      return;
    }
    if (!details.trim()) {
      toast({ title: "Error", description: "Details are required.", variant: "destructive" });
      return;
    }

    try {
      // Prepare payload with proper typing
      const payload: GenerateDocumentPayload = {
        doctype_id: documentType,
        details: details.trim(),
        doc_id: documentId,
        user_id: currentUser?.user_id,
        customer_desc: "",
        requested_amount: null,
        customer_number: null
      };

      // Only include amount and customer number for transactional documents
      if (isTransactionalDoc) {
        payload.requested_amount = amount || null;
        payload.customer_number = customerNumber || null;
      }

      await api.post("/generate-doc", payload);

      toast({
        title: "Success",
        description: "Document saved as draft.",
      });

      if (onDocumentSubmit) {
        onDocumentSubmit({
          id: documentId,
          referenceNumber: documentId,
          uploadDate: new Date().toISOString().split("T")[0],
          type: documentTypes.find(t => String(t.id) === documentType)?.description || documentType,
          description: details,
          status: "DRAFT",
          fileName: file?.name,
          amount: isTransactionalDoc ? amount : undefined,
          customerNumber: isTransactionalDoc ? customerNumber : undefined,
        });
      }

      handleClear();
    } catch (err: unknown) {
      let message = "Could not save draft.";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        message = axiosErr.response?.data?.message || message;
      }

      toast({
        title: "Save Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setDocumentType("");
    setDocumentId("");
    setAmount("");
    setCustomerNumber("");
    setDetails("");
    setFile(null);
    setSelectedDocType(null);
    setShowPreviewModal(false);
    setUploadProgress(0);
    if (onClearTemplate) onClearTemplate();
  };

  // Get PDF URL for iframe display (only for uploaded documents)
  const getPdfUrl = () => {
    if (documentId) {
      return `http://10.203.14.169/dms/filesearch-${documentId}`;
    }
    if (file) {
      return URL.createObjectURL(file);
    }
    return "";
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Document Type <span className="text-destructive">*</span>
            </Label>
            {loadingTypes ? (
              <div className="text-xs text-muted-foreground animate-pulse">Loading types...</div>
            ) : (
              <Select value={documentType} onValueChange={handleDocumentTypeChange}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Document Type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)} className="text-xs">
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
            )}
            {selectedDocType && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {selectedDocType.trans_type === "1" 
                  ? "This is a transactional document" 
                  : "This is a non-transactional document"}
              </p>
            )}
          </div>

          {/* Document ID */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Document ID <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={documentId}
                disabled
                placeholder="Generated after successful upload"
                className="h-9 text-xs bg-muted/50 flex-1"
              />
              {documentId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={handleViewFile}
                  title="View Document"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Amount & Customer Number - Only show for transactional documents */}
        {isTransactionalDoc ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Requested Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Customer Number</Label>
              <div className="flex gap-2">
                <Input
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  placeholder="Enter customer number"
                  className="h-9 text-xs"
                />
                <Button variant="outline" size="sm" className="h-9 px-3">
                  <Search className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-muted-foreground italic p-2 py-0 bg-muted/20 rounded-md text-center">
            Amount and Customer Number fields are only available for transactional documents.
          </div>
        )}

        {/* Details */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            Details <span className="text-destructive">*</span>
          </Label>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Enter document details..."
            className="min-h-[80px] text-xs resize-none"
          />
        </div>

        {/* File Upload Section */}
        <FileUpload
          onFileSelect={handleFileSelect}
          onView={handleViewFile}
          onRemove={handleRemoveFile}
          documentId={documentId}
          disabled={uploading}
          showDocumentId={true}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button
            onClick={handleSaveDraft}
            disabled={!documentId || !documentType || !details.trim() || uploading}
          >
            Save as Draft
          </Button>
        </div>
      </div>

      {/* Single Preview/Upload Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {documentId ? "Document Preview" : "Preview & Upload"}
            </DialogTitle>
            <DialogDescription>
              {documentId 
                ? "Viewing uploaded document" 
                : "Preview your document before uploading"}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 border rounded-lg overflow-hidden h-[500px] bg-black/5 relative">
            {getPdfUrl() ? (
              <iframe
                src={getPdfUrl()}
                title="PDF Preview"
                className="w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FileText className="h-12 w-12 mb-4" />
                <p>No document to display</p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {!documentId && uploading && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <DialogFooter className="gap-3 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowPreviewModal(false)}
              disabled={uploading}
            >
              Close
            </Button>

            {/* Only show Confirm Upload when we don't have an ID yet */}
            {!documentId && file && !uploading && (
              <Button
                onClick={handleUploadConfirm}
                disabled={uploading}
              >
                Confirm Upload
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}