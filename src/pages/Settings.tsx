/**
 * Settings Page
 * =============
 * Main settings page with tabbed interface for Users, Parameters,
 * Document Approval Setup, and Beneficiary management.
 */

import { useState, useEffect } from "react";
import { Users, FileType, GitBranch, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { UsersTab } from "@/components/settings/UsersTab";
import { ParametersTab } from "@/components/settings/ParametersTab";
import { ApprovalSetupTab } from "@/components/settings/ApprovalSetupTab";
import { BeneficiaryTab } from "@/components/settings/BeneficiaryTab";
import { SettingsSkeleton } from "@/components/skeletons/SettingsSkeleton";

const tabs = [
  { id: "users", label: "Users", icon: Users },
  { id: "parameters", label: "Parameters", icon: FileType },
  { id: "approval", label: "Document Approval Setup", icon: GitBranch },
  { id: "beneficiary", label: "Beneficiary Setup", icon: Building2 },
];

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="p-4 lg:p-6 pt-14 lg:pt-6">
      {/* Header with Date/Time and Theme Toggle */}
      <PageHeader
        title="Settings"
        description="Manage users, parameters, and system configurations"
      />

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
        {/* Tab List - Scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 mb-4">
          <TabsList className="inline-flex h-10 w-auto min-w-full lg:min-w-0 bg-muted/50 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 text-xs whitespace-nowrap px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Contents */}
        <TabsContent value="users" className="mt-0">
          <div className="rounded-xl bg-card p-4 shadow-card-md animate-fade-in">
            <UsersTab />
          </div>
        </TabsContent>

        <TabsContent value="parameters" className="mt-0">
          <div className="rounded-xl bg-card p-4 shadow-card-md animate-fade-in">
            <ParametersTab />
          </div>
        </TabsContent>

        <TabsContent value="approval" className="mt-0">
          <div className="rounded-xl bg-card p-4 shadow-card-md animate-fade-in">
            <ApprovalSetupTab />
          </div>
        </TabsContent>

        <TabsContent value="beneficiary" className="mt-0">
          <div className="rounded-xl bg-card p-4 shadow-card-md animate-fade-in">
            <BeneficiaryTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
