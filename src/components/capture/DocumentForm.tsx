import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "./FileUpload";
import { Template } from "./QuickTemplates";
import { useToast } from "@/hooks/use-toast";

const documentTypes = [
  { value: "expense", label: "Expense Report" },
  { value: "invoice", label: "Invoice" },
  { value: "receipt", label: "Receipt" },
  { value: "contract", label: "Contract" },
];

interface DocumentFormProps {
  selectedTemplate?: Template | null;
  onClearTemplate?: () => void;
  onDocumentSubmit?: (document: {
    id: string;
    referenceNumber: string;
    uploadDate: string;
    type: string;
    description: string;
    status: "DRAFT";
    fileName?: string;
    amount?: string;
    customerNumber?: string;
  }) => void;
}

export function DocumentForm({ selectedTemplate, onClearTemplate, onDocumentSubmit }: DocumentFormProps) {
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [amount, setAmount] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [details, setDetails] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Apply template when selected
  useEffect(() => {
    if (selectedTemplate) {
      setDocumentType(selectedTemplate.documentType);
      setDetails(selectedTemplate.defaultDescription);
      // Generate document ID when template is applied
      setDocumentId(`DOC-${Date.now().toString().slice(-8)}`);
    }
  }, [selectedTemplate]);

  const handleClear = () => {
    setDocumentType("");
    setDocumentId("");
    setAmount("");
    setCustomerNumber("");
    setDetails("");
    setFile(null);
    if (onClearTemplate) {
      onClearTemplate();
    }
  };

  const handleSave = () => {
    // Validation
    if (!documentType) {
      toast({
        title: "Validation Error",
        description: "Please select a document type.",
        variant: "destructive",
      });
      return;
    }

    // Generate document ID if not already set
    const newId = documentId || `DOC-${Date.now().toString().slice(-8)}`;
    const referenceNumber = `T${Math.floor(Math.random() * 900000000 + 100000000)}`;

    // Create document object
    const newDocument = {
      id: newId,
      referenceNumber,
      uploadDate: new Date().toISOString().split('T')[0],
      type: documentTypes.find(t => t.value === documentType)?.label.toUpperCase() || documentType.toUpperCase(),
      description: details || "No description provided",
      status: "DRAFT" as const,
      fileName: file?.name,
      amount,
      customerNumber,
    };

    // Notify parent component
    if (onDocumentSubmit) {
      onDocumentSubmit(newDocument);
    }

    toast({
      title: "Document Saved",
      description: `Document ${referenceNumber} has been saved as draft.`,
    });

    // Clear form
    handleClear();
  };

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile && !documentId) {
      // Auto-generate ID when file is uploaded
      setDocumentId(`DOC-${Date.now().toString().slice(-8)}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Template indicator */}
      {selectedTemplate && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-xs text-primary font-medium">
            Using template: {selectedTemplate.name}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs text-primary hover:text-primary"
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Document</label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select Document Type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-xs">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Document ID</label>
          <Input
            value={documentId}
            disabled
            placeholder="Auto-generated after upload"
            className="h-9 text-xs bg-muted/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Requested Amount</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Customer Number</label>
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

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Details</label>
        <Textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Enter document details..."
          className="min-h-[80px] text-xs resize-none"
        />
      </div>

      <FileUpload onFileSelect={handleFileSelect} />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={handleClear} className="h-9 text-xs px-4">
          Clear
        </Button>
        <Button onClick={handleSave} className="h-9 text-xs px-4">
          Save as Draft
        </Button>
      </div>
    </div>
  );
}
