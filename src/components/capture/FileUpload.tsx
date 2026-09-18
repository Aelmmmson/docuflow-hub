import { useCallback, useState } from "react";
import { Upload, FileText, X, Eye, ExternalLink, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scanner } from "./Scanner";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  onScanSuccess?: (documentId: string, file?: File) => void;
  onView?: () => void;           // optional: trigger view modal from parent
  onRemove?: () => void;         // optional: trigger remove from parent
  documentId?: string;           // document ID from server
  disabled?: boolean;
  showDocumentId?: boolean;      // whether to show document ID in the file card
  documentType?: string;
  documentDescription?: string;
  scannedBy?: string;
  branch?: string;
}

export function FileUpload({ 
  onFileSelect,
  onScanSuccess,
  onView, 
  onRemove, 
  documentId, 
  disabled = false,
  showDocumentId = true,
  documentType,
  documentDescription,
  scannedBy,
  branch = "000",
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeMode, setActiveMode] = useState<"upload" | "scan">("upload");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type === "application/pdf") {
        setSelectedFile(files[0]);
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && files[0].type === "application/pdf") {
        setSelectedFile(files[0]);
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    onFileSelect(null);
    if (onRemove) {
      onRemove();
    }
  }, [onFileSelect, onRemove]);

  const handleView = useCallback(() => {
    if (onView) {
      onView();
    }
  }, [onView]);

  const handleScanCompleted = useCallback(
    (token: string, file?: File) => {
      if (file) {
        setSelectedFile(file);
      }
      if (onScanSuccess) {
        onScanSuccess(token, file);
      } else if (file) {
        onFileSelect(file);
      }
    },
    [onScanSuccess, onFileSelect]
  );

  // Determine if we should show the uploaded file card
  const showFileCard = selectedFile || (documentId && showDocumentId);

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-foreground">
        Document Source <span className="text-destructive">*</span>
      </Label>

      {showFileCard ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">
                {selectedFile?.name || "Scanned / Uploaded Document"}
              </p>
              {documentId && showDocumentId && (
                <p className="text-2xs text-muted-foreground">
                  Document ID: <span className="font-semibold text-primary">{documentId}</span>
                </p>
              )}
              {selectedFile && !documentId && (
                <p className="text-2xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onView && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleView}
                disabled={disabled}
                title={documentId ? "View Document" : "Preview Document"}
              >
                {documentId ? (
                  <ExternalLink className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
              disabled={disabled}
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Tabs
          value={activeMode}
          onValueChange={(val) => setActiveMode(val as "upload" | "scan")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-9 p-1">
            <TabsTrigger value="upload" className="text-xs gap-1.5 py-1">
              <Upload className="h-3.5 w-3.5" />
              Upload PDF File
            </TabsTrigger>
            <TabsTrigger value="scan" className="text-xs gap-1.5 py-1">
              <Printer className="h-3.5 w-3.5" />
              Scan Document
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-2">
            <label
              className={cn(
                "block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
              />
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex flex-col items-center justify-center",
                  isDragOver && "border-primary bg-primary/5"
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-2xs text-muted-foreground mt-1">
                  PDF files only
                </p>
              </div>
            </label>
          </TabsContent>

          <TabsContent value="scan" className="mt-2">
            <Scanner
              onScanSuccess={handleScanCompleted}
              documentType={documentType}
              documentDescription={documentDescription}
              scannedBy={scannedBy}
              branch={branch}
              disabled={disabled}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}