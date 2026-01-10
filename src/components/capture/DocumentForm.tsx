import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "./FileUpload";

const documentTypes = [
  { value: "expense", label: "Expense Report" },
  { value: "invoice", label: "Invoice" },
  { value: "receipt", label: "Receipt" },
  { value: "contract", label: "Contract" },
];

export function DocumentForm() {
  const [documentType, setDocumentType] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [amount, setAmount] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [details, setDetails] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleClear = () => {
    setDocumentType("");
    setDocumentId("");
    setAmount("");
    setCustomerNumber("");
    setDetails("");
    setFile(null);
  };

  const handleSave = () => {
    // Generate document ID on save
    const newId = `DOC-${Date.now().toString().slice(-8)}`;
    setDocumentId(newId);
    // In a real app, this would submit to a backend
  };

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      // Auto-generate ID when file is uploaded
      setDocumentId(`DOC-${Date.now().toString().slice(-8)}`);
    } else {
      setDocumentId("");
    }
  };

  return (
    <div className="space-y-4">
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
          Save
        </Button>
      </div>
    </div>
  );
}
