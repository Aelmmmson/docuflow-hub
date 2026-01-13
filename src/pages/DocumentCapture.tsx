/**
 * Document Capture Page
 * =====================
 * Main document capture page with tabs for Request, Generated, and Enquiry.
 */

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentForm } from "@/components/capture/DocumentForm";
import { GeneratedTab } from "@/components/capture/GeneratedTab";
import { EnquiryTab } from "@/components/capture/EnquiryTab";
import { QuickTemplates } from "@/components/capture/QuickTemplates";
import { RecentUploads } from "@/components/capture/RecentUploads";
import { DocumentCaptureSkeleton } from "@/components/skeletons/DocumentCaptureSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { FileInput, FileText, Search } from "lucide-react";

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
      {/* Header with Date/Time and Theme Toggle */}
      <PageHeader
        title="Document Capture"
        description="Create, manage, and track document requests"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <TabsList className="grid w-full grid-cols-3 h-10 bg-muted/50">
              <TabsTrigger value="request" className="text-xs flex items-center gap-1.5 data-[state=active]:bg-card">
                <FileInput className="h-3.5 w-3.5" />
                Request
              </TabsTrigger>
              <TabsTrigger value="generated" className="text-xs flex items-center gap-1.5 data-[state=active]:bg-card">
                <FileText className="h-3.5 w-3.5" />
                Generated
              </TabsTrigger>
              <TabsTrigger value="enquiry" className="text-xs flex items-center gap-1.5 data-[state=active]:bg-card">
                <Search className="h-3.5 w-3.5" />
                Enquiry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="request" className="mt-4">
              <div className="rounded-xl bg-card p-4 shadow-card-md">
                <h3 className="text-xs font-semibold text-card-foreground mb-4">Document Request Form</h3>
                <DocumentForm />
              </div>
            </TabsContent>

            <TabsContent value="generated" className="mt-4">
              <div className="rounded-xl bg-card p-4 shadow-card-md">
                <h3 className="text-xs font-semibold text-card-foreground mb-4">Generated Documents</h3>
                <GeneratedTab />
              </div>
            </TabsContent>

            <TabsContent value="enquiry" className="mt-4">
              <div className="rounded-xl bg-card p-4 shadow-card-md">
                <h3 className="text-xs font-semibold text-card-foreground mb-4">Document Enquiries</h3>
                <EnquiryTab />
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
