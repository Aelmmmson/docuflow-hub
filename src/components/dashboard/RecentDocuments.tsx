import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  title: string;
  reference: string;
  status: "Submitted" | "Paid" | "Approved" | "Rejected" | "Pending";
}

const documents: Document[] = [
  { id: "1", title: "Newspaper Expense", reference: "EXP-2024-0012", status: "Submitted" },
  { id: "2", title: "Electric Expenses", reference: "EXP-2024-0011", status: "Paid" },
  { id: "3", title: "Office Supplies", reference: "EXP-2024-0010", status: "Approved" },
  { id: "4", title: "Travel Reimbursement", reference: "EXP-2024-0009", status: "Pending" },
  { id: "5", title: "Software License", reference: "EXP-2024-0008", status: "Approved" },
];

const statusStyles: Record<Document["status"], string> = {
  Submitted: "status-submitted",
  Paid: "status-paid",
  Approved: "status-approved",
  Rejected: "status-rejected",
  Pending: "status-pending",
};

export function RecentDocuments() {
  return (
    <div className="rounded-xl bg-card p-4 shadow-card-md animate-fade-in" style={{ animationDelay: "200ms" }}>
      <h3 className="text-xs font-semibold text-card-foreground mb-3">Recent Documents</h3>
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <div
            key={doc.id}
            className="flex items-center justify-between rounded-lg bg-muted/50 p-2.5 transition-colors hover:bg-muted animate-fade-in"
            style={{ animationDelay: `${300 + index * 50}ms` }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-card-foreground">{doc.title}</p>
                <p className="text-2xs text-muted-foreground">{doc.reference}</p>
              </div>
            </div>
            <span className={cn("rounded-full px-2 py-0.5 text-2xs font-medium", statusStyles[doc.status])}>
              {doc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
