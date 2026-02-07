import { useCallback, useState } from "react";
import { Upload, FileText, X, Eye, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "recharts";
import { Button } from "../ui/button";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  onView?: () => void;           // optional: trigger view modal from parent
  onRemove?: () => void;         // optional: trigger remove from parent
  documentId?: string;           // document ID from server
  disabled?: boolean;
  showDocumentId?: boolean;      // whether to show document ID in the file card
}

export function FileUpload({ 
  onFileSelect, 
  onView, 
  onRemove, 
  documentId, 
  disabled = false,
  showDocumentId = true 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  // Determine if we should show the uploaded file card
  const showFileCard = selectedFile || (documentId && showDocumentId);

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-foreground">
        Upload Document <span className="text-destructive">*</span>
      </Label>

      {showFileCard ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">
                {selectedFile?.name || "Uploaded Document"}
              </p>
              {documentId && showDocumentId && (
                <p className="text-2xs text-muted-foreground">
                  Document ID: {documentId}
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
              className="h-7 w-7"
              onClick={handleRemove}
              disabled={disabled}
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label className={cn(
          "block cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-primary/50 hover:bg-muted/50"
        )}>
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
      )}
    </div>
  );
}