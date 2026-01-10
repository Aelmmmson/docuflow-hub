import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
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
      if (files && files.length > 0) {
        setSelectedFile(files[0]);
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    onFileSelect(null);
  }, [onFileSelect]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground">Upload Document</label>
      
      {selectedFile ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
              <FileText className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-2xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs font-medium text-foreground">
            Click to upload or drag and drop
          </p>
          <p className="text-2xs text-muted-foreground mt-1">
            PDF (MAX. 800x400px)
          </p>
        </div>
      )}
    </div>
  );
}
