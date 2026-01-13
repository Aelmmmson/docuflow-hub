/**
 * ApprovalSetupTab Component
 * ==========================
 * Settings tab for managing document approval workflows with multi-stage wizard.
 */

import { useState } from "react";
import { Plus, Edit2, Save, ChevronLeft, ChevronRight, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { DataTable, Column } from "@/components/shared/DataTable";
import { ActionMenu } from "@/components/shared/ActionMenu";
import { RightAside } from "@/components/shared/RightAside";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ApprovalStage {
  description: string;
  quorum: number;
  approvers: string[];
  mandatoryApprovers: string[];
}

interface ApprovalSetup {
  id: string;
  documentType: string;
  stages: ApprovalStage[];
  approversCount: number;
  requiredApproversCount: number;
}

// Mock data
const mockApprovalSetups: ApprovalSetup[] = [
  {
    id: "APR001",
    documentType: "Electric Expenses",
    stages: [
      { description: "Manager Review", quorum: 1, approvers: ["John Doe", "Jane Smith"], mandatoryApprovers: ["John Doe"] },
      { description: "Finance Approval", quorum: 2, approvers: ["Alice Brown", "Bob Wilson", "Charlie Davis"], mandatoryApprovers: ["Alice Brown"] },
    ],
    approversCount: 5,
    requiredApproversCount: 2,
  },
  {
    id: "APR002",
    documentType: "Travel Reimbursement",
    stages: [
      { description: "Supervisor Check", quorum: 1, approvers: ["Jane Smith"], mandatoryApprovers: ["Jane Smith"] },
      { description: "HR Review", quorum: 1, approvers: ["Bob Wilson", "Charlie Davis"], mandatoryApprovers: [] },
      { description: "Finance Sign-off", quorum: 1, approvers: ["Alice Brown"], mandatoryApprovers: ["Alice Brown"] },
    ],
    approversCount: 4,
    requiredApproversCount: 3,
  },
];

const mockDocumentTypes = [
  "Electric Expenses",
  "Newspaper Expense",
  "Travel Reimbursement",
  "Office Supplies",
  "Invoice Payment",
];

const mockApprovers = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Bob Wilson" },
  { id: "4", name: "Alice Brown" },
  { id: "5", name: "Charlie Davis" },
  { id: "6", name: "David Lee" },
  { id: "7", name: "Emma White" },
];

export function ApprovalSetupTab() {
  const { toast } = useToast();
  const [setups, setSetups] = useState<ApprovalSetup[]>(mockApprovalSetups);
  const [searchValue, setSearchValue] = useState("");

  // Aside state
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [editingSetup, setEditingSetup] = useState<ApprovalSetup | null>(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0); // 0 = config, 1+ = stages
  const [documentType, setDocumentType] = useState("");
  const [numberOfStages, setNumberOfStages] = useState(1);
  const [stages, setStages] = useState<ApprovalStage[]>([]);

  const filteredSetups = setups.filter((setup) =>
    setup.documentType.toLowerCase().includes(searchValue.toLowerCase()) ||
    setup.id.toLowerCase().includes(searchValue.toLowerCase())
  );

  const initializeStages = (count: number) => {
    const newStages: ApprovalStage[] = Array.from({ length: count }, () => ({
      description: "",
      quorum: 1,
      approvers: [],
      mandatoryApprovers: [],
    }));
    setStages(newStages);
  };

  const handleAddNew = () => {
    setEditingSetup(null);
    setCurrentStep(0);
    setDocumentType("");
    setNumberOfStages(1);
    setStages([{ description: "", quorum: 1, approvers: [], mandatoryApprovers: [] }]);
    setIsAsideOpen(true);
  };

  const handleEdit = (setup: ApprovalSetup) => {
    setEditingSetup(setup);
    setCurrentStep(0);
    setDocumentType(setup.documentType);
    setNumberOfStages(setup.stages.length);
    setStages([...setup.stages]);
    setIsAsideOpen(true);
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      if (!documentType) {
        toast({
          title: "Validation Error",
          description: "Please select a document type.",
          variant: "destructive",
        });
        return;
      }
      // Initialize stages if needed
      if (stages.length !== numberOfStages) {
        initializeStages(numberOfStages);
      }
    }
    
    if (currentStep > 0) {
      const stageIndex = currentStep - 1;
      const stage = stages[stageIndex];
      if (!stage.description) {
        toast({
          title: "Validation Error",
          description: "Please enter a stage description.",
          variant: "destructive",
        });
        return;
      }
      if (stage.approvers.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please select at least one approver.",
          variant: "destructive",
        });
        return;
      }
      if (stage.quorum > stage.approvers.length) {
        toast({
          title: "Validation Error",
          description: "Quorum cannot exceed the number of approvers.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setCurrentStep((prev) => Math.min(prev + 1, numberOfStages));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSaveAll = () => {
    // Validate last stage
    const lastStageIndex = currentStep - 1;
    const lastStage = stages[lastStageIndex];
    if (!lastStage?.description || lastStage.approvers.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please complete all stage fields.",
        variant: "destructive",
      });
      return;
    }

    const totalApprovers = stages.reduce((acc, s) => acc + s.approvers.length, 0);
    const totalMandatory = stages.reduce((acc, s) => acc + s.mandatoryApprovers.length, 0);

    if (editingSetup) {
      setSetups((prev) =>
        prev.map((s) =>
          s.id === editingSetup.id
            ? {
                ...s,
                documentType,
                stages,
                approversCount: totalApprovers,
                requiredApproversCount: totalMandatory,
              }
            : s
        )
      );
      toast({
        title: "Approval Setup Updated",
        description: `${documentType} workflow has been updated.`,
      });
    } else {
      const newSetup: ApprovalSetup = {
        id: `APR${String(setups.length + 1).padStart(3, "0")}`,
        documentType,
        stages,
        approversCount: totalApprovers,
        requiredApproversCount: totalMandatory,
      };
      setSetups((prev) => [...prev, newSetup]);
      toast({
        title: "Approval Setup Created",
        description: `${documentType} workflow has been created.`,
      });
    }

    setIsAsideOpen(false);
  };

  const updateStage = (index: number, updates: Partial<ApprovalStage>) => {
    setStages((prev) =>
      prev.map((stage, i) => (i === index ? { ...stage, ...updates } : stage))
    );
  };

  const toggleApprover = (stageIndex: number, approverName: string) => {
    const stage = stages[stageIndex];
    const isSelected = stage.approvers.includes(approverName);
    
    if (isSelected) {
      updateStage(stageIndex, {
        approvers: stage.approvers.filter((a) => a !== approverName),
        mandatoryApprovers: stage.mandatoryApprovers.filter((a) => a !== approverName),
      });
    } else {
      updateStage(stageIndex, {
        approvers: [...stage.approvers, approverName],
      });
    }
  };

  const toggleMandatory = (stageIndex: number, approverName: string) => {
    const stage = stages[stageIndex];
    const isMandatory = stage.mandatoryApprovers.includes(approverName);
    
    updateStage(stageIndex, {
      mandatoryApprovers: isMandatory
        ? stage.mandatoryApprovers.filter((a) => a !== approverName)
        : [...stage.mandatoryApprovers, approverName],
    });
  };

  const columns: Column<ApprovalSetup>[] = [
    { key: "id", header: "ID", className: "w-20" },
    { key: "documentType", header: "Document Type" },
    {
      key: "stages",
      header: "Approval Stages",
      render: (setup) => (
        <Badge variant="secondary" className="text-xs">
          {setup.stages.length} Stage{setup.stages.length > 1 ? "s" : ""}
        </Badge>
      ),
    },
    {
      key: "approversCount",
      header: "Approvers",
      render: (setup) => <span className="text-xs">{setup.approversCount}</span>,
    },
    {
      key: "requiredApproversCount",
      header: "Required",
      render: (setup) => <span className="text-xs">{setup.requiredApproversCount}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (setup) => (
        <ActionMenu
          actions={[
            {
              label: "Edit",
              icon: <Edit2 className="h-3 w-3" />,
              onClick: () => handleEdit(setup),
            },
          ]}
        />
      ),
    },
  ];

  const totalSteps = numberOfStages + 1; // Config step + stage steps

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <SearchFilter
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search approval setups..."
        />
        <Button onClick={handleAddNew} size="sm" className="ml-3 shrink-0">
          <Plus className="h-4 w-4 mr-1" />
          Add New
        </Button>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border border-border bg-card">
        <DataTable
          data={filteredSetups}
          columns={columns}
          keyExtractor={(setup) => setup.id}
          emptyMessage="No approval setups found"
        />
      </div>

      {/* Right Aside Panel with Wizard */}
      <RightAside
        isOpen={isAsideOpen}
        onClose={() => setIsAsideOpen(false)}
        title={editingSetup ? "Edit Approval Setup" : "Add Approval Setup"}
        subtitle={currentStep === 0 ? "Configure workflow" : `Stage ${currentStep} of ${numberOfStages}`}
        width="lg"
      >
        <div className="space-y-6">
          {/* Step 0: Configuration */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="documentType" className="text-xs font-medium">
                  Select Document Type <span className="text-destructive">*</span>
                </Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="documentType" className="h-9">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDocumentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stages" className="text-xs font-medium">
                  Number of Approval Stages <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stages"
                  type="number"
                  min={1}
                  max={10}
                  value={numberOfStages}
                  onChange={(e) => {
                    const val = Math.min(10, Math.max(1, parseInt(e.target.value) || 1));
                    setNumberOfStages(val);
                    initializeStages(val);
                  }}
                  className="h-9"
                />
                <p className="text-[10px] text-muted-foreground">
                  You can configure 1-10 approval stages
                </p>
              </div>
            </div>
          )}

          {/* Stage Configuration Steps */}
          {currentStep > 0 && stages[currentStep - 1] && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {currentStep}
                </div>
                <span className="text-sm font-medium">Stage {currentStep}</span>
              </div>

              {/* Stage Description */}
              <div className="space-y-2">
                <Label htmlFor="stageDesc" className="text-xs font-medium">
                  Stage Description <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stageDesc"
                  value={stages[currentStep - 1].description}
                  onChange={(e) => updateStage(currentStep - 1, { description: e.target.value })}
                  placeholder="e.g., Manager Review"
                  className="h-9"
                />
              </div>

              {/* Quorum */}
              <div className="space-y-2">
                <Label htmlFor="quorum" className="text-xs font-medium">
                  Quorum (minimum approvals required) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quorum"
                  type="number"
                  min={1}
                  max={stages[currentStep - 1].approvers.length || 10}
                  value={stages[currentStep - 1].quorum}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    updateStage(currentStep - 1, { quorum: val });
                  }}
                  className="h-9"
                />
                {stages[currentStep - 1].quorum > stages[currentStep - 1].approvers.length && stages[currentStep - 1].approvers.length > 0 && (
                  <p className="text-[10px] text-destructive">
                    Quorum cannot exceed number of selected approvers
                  </p>
                )}
              </div>

              {/* Select Approvers */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  Select Approvers <span className="text-destructive">*</span>
                </Label>
                <div className="border border-border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {mockApprovers.map((approver) => {
                    const isSelected = stages[currentStep - 1].approvers.includes(approver.name);
                    return (
                      <div
                        key={approver.id}
                        onClick={() => toggleApprover(currentStep - 1, approver.name)}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                          isSelected ? "bg-primary/10" : "hover:bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}>
                            {approver.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="text-xs">{approver.name}</span>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    );
                  })}
                </div>
                {stages[currentStep - 1].approvers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {stages[currentStep - 1].approvers.map((name) => (
                      <Badge key={name} variant="secondary" className="text-[10px]">
                        {name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Mandatory Approvers */}
              {stages[currentStep - 1].approvers.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Mandatory Approvers <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <div className="border border-border rounded-lg p-3 space-y-2">
                    {stages[currentStep - 1].approvers.map((approverName) => {
                      const isMandatory = stages[currentStep - 1].mandatoryApprovers.includes(approverName);
                      return (
                        <div key={approverName} className="flex items-center gap-2">
                          <Checkbox
                            id={`mandatory-${approverName}`}
                            checked={isMandatory}
                            onCheckedChange={() => toggleMandatory(currentStep - 1, approverName)}
                          />
                          <Label
                            htmlFor={`mandatory-${approverName}`}
                            className="text-xs font-normal cursor-pointer"
                          >
                            {approverName}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 py-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => i <= currentStep && setCurrentStep(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentStep
                    ? "w-6 bg-primary"
                    : i < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePreviousStep} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            {currentStep < numberOfStages ? (
              <Button onClick={handleNextStep} className="flex-1">
                {currentStep === 0 ? "Start" : "Next Stage"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSaveAll} className="flex-1">
                <Save className="h-4 w-4 mr-1" />
                Save All
              </Button>
            )}
          </div>
        </div>
      </RightAside>
    </div>
  );
}
