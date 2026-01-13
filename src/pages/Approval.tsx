import { ApprovalSkeleton } from "@/components/skeletons/ApprovalSkeleton";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const pendingDocuments = [
  {
    id: 1,
    title: "Invoice #2024-001",
    type: "Invoice",
    submittedBy: "Henry Amoh",
    submittedAt: "2024-01-15",
    amount: "$2,450.00",
  },
  {
    id: 2,
    title: "Expense Report Q4",
    type: "Expense",
    submittedBy: "Sarah Miller",
    submittedAt: "2024-01-14",
    amount: "$1,890.00",
  },
  {
    id: 3,
    title: "Purchase Order #789",
    type: "Purchase Order",
    submittedBy: "Mike Johnson",
    submittedAt: "2024-01-13",
    amount: "$5,200.00",
  },
];

export default function Approval() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ApprovalSkeleton />;
  }

  return (
    <div className="p-4 lg:p-6 pt-14 lg:pt-6">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-lg font-bold text-foreground">Approval Queue</h1>
        <p className="text-xs text-muted-foreground">
          Review and approve pending documents
        </p>
      </div>

      {/* Pending Documents */}
      <div className="space-y-4">
        {pendingDocuments.map((doc, index) => (
          <div
            key={doc.id}
            className="rounded-xl bg-card p-4 shadow-card-md border border-border animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {doc.type} • Submitted by {doc.submittedBy}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-2xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {doc.submittedAt}
                    </Badge>
                    <span className="text-xs font-semibold text-foreground">
                      {doc.amount}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
