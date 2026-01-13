import { ApprovalSkeleton } from "@/components/skeletons/ApprovalSkeleton";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState(pendingDocuments);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = (id: number, title: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    toast({
      title: "Document Approved",
      description: `${title} has been approved successfully.`,
    });
  };

  const handleReject = (id: number, title: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    toast({
      title: "Document Rejected",
      description: `${title} has been rejected.`,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return <ApprovalSkeleton />;
  }

  return (
    <div className="p-4 lg:p-6 pt-14 lg:pt-6">
      {/* Header with Date/Time and Theme Toggle */}
      <PageHeader
        title="Approval Queue"
        description="Review and approve pending documents"
      />

      {/* Pending Documents */}
      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="rounded-xl bg-card p-8 shadow-card-md border border-border text-center animate-fade-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">All Caught Up!</h3>
            <p className="text-xs text-muted-foreground mt-1">
              No pending documents to approve
            </p>
          </div>
        ) : (
          documents.map((doc, index) => (
            <div
              key={doc.id}
              className="rounded-xl bg-card p-4 shadow-card-md border border-border animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
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
                <div className="flex gap-2 sm:shrink-0">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-destructive hover:bg-destructive/10 flex-1 sm:flex-none"
                    onClick={() => handleReject(doc.id, doc.title)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
                    onClick={() => handleApprove(doc.id, doc.title)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
