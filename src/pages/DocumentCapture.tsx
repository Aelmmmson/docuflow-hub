import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentForm } from "@/components/capture/DocumentForm";
import { QuickTemplates } from "@/components/capture/QuickTemplates";
import { RecentUploads } from "@/components/capture/RecentUploads";
import { DocumentCaptureSkeleton } from "@/components/skeletons/DocumentCaptureSkeleton";
import { FileText, Search } from "lucide-react";

export default function DocumentCapture() {
  const [activeTab, setActiveTab] = useState("request");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DocumentCaptureSkeleton />;
  }

  return (
    <div className="p-4 lg:p-6 pt-14 lg:pt-6">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-lg font-bold text-foreground">Document Capture</h1>
        <p className="text-xs text-muted-foreground">
          Create and manage document requests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <TabsList className="grid w-full grid-cols-3 h-9">
              <TabsTrigger value="request" className="text-xs">Request</TabsTrigger>
              <TabsTrigger value="generated" className="text-xs">Generated</TabsTrigger>
              <TabsTrigger value="enquiry" className="text-xs">Enquiry</TabsTrigger>
            </TabsList>

            <TabsContent value="request" className="mt-4">
              <div className="rounded-xl bg-card p-4 shadow-card-md">
                <h3 className="text-xs font-semibold text-card-foreground mb-4">Document Request Form</h3>
                <DocumentForm />
              </div>
            </TabsContent>

            <TabsContent value="generated" className="mt-4">
              <div className="rounded-xl bg-card p-6 shadow-card-md">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">No Generated Documents</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Documents you generate will appear here
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="enquiry" className="mt-4">
              <div className="rounded-xl bg-card p-6 shadow-card-md">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Document Enquiry</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Search and query existing documents
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <QuickTemplates />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <RecentUploads />
          </div>
        </div>
      </div>
    </div>
  );
}
