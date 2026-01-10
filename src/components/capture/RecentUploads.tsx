import { FileText } from "lucide-react";

const recentFiles = [
  { name: "Invoice_2024_001.pdf", size: "245 KB" },
  { name: "Receipt_March.pdf", size: "128 KB" },
  { name: "Contract_Draft.pdf", size: "512 KB" },
  { name: "Expense_Report.pdf", size: "89 KB" },
];

export function RecentUploads() {
  return (
    <div className="rounded-xl bg-card p-4 shadow-card-md">
      <h3 className="text-xs font-semibold text-card-foreground mb-3">Recent Documents</h3>
      <div className="space-y-2">
        {recentFiles.map((file) => (
          <div
            key={file.name}
            className="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
              <FileText className="h-4 w-4 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-card-foreground truncate">{file.name}</p>
              <p className="text-2xs text-muted-foreground">{file.size}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
