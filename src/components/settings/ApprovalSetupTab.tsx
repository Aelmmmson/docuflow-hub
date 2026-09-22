/**
 * ApprovalSetupTab Component
 * ==========================
 * Settings tab for managing document approval workflows with multi-stage wizard.
 */

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Save, ChevronLeft, ChevronRight, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { DataTable, Column } from "@/components/shared/DataTable";
import { RightAside } from "@/components/shared/RightAside";
import { useToast } from "@/hooks/use-toast";
import { cn, getErrorMessage } from "@/lib/utils";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

interface ApprovalStage {
  name: string;
  quorum: number;
  approvers: string[];
  mandatoryApprovers: string[];
  scope: "BRANCH" | "HEAD_OFFICE";
  isRequired: boolean;
  thresholdAmount: number;
}

interface DocumentType {
  id: string;
  description: string;
  trans_type: string;
}

interface ApprovalSetup {
  approval_stages: number;
  id: number;
  description: string;
  doctype_id: number;
  number_of_approvers: number;
  mandatory_approvers: number;
  details: string | Array<{
    name: string;
    quorum: string;
    scope?: "BRANCH" | "HEAD_OFFICE";
    isRequired?: boolean;
    is_required?: boolean;
    thresholdAmount?: number;
    threshold_amount?: number;
    approvers: Array<{
      userId: number;
      name: string;
      isMandatory: boolean;
    }>;
  }>;
}

interface ApproverOption {
  userId: string;
  name: string;
}

export function ApprovalSetupTab() {
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  const [setups, setSetups] = useState<ApprovalSetup[]>([]);
  const [searchValue, setSearchValue] = useState("");

  // Aside states
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [editingSetup, setEditingSetup] = useState<ApprovalSetup | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingSetup, setViewingSetup] = useState<ApprovalSetup | null>(null);

  // Wizard states
  const [currentStep, setCurrentStep] = useState(0);
  const [documentType, setDocumentType] = useState("");
  const [availableDocumentTypes, setAvailableDocumentTypes] = useState<DocumentType[]>([]);
  const [numberOfStages, setNumberOfStages] = useState(1);
  const [numberOfStagesInput, setNumberOfStagesInput] = useState<string>("1");
  const [stages, setStages] = useState<ApprovalStage[]>([]);

  const [availableApprovers, setAvailableApprovers] = useState<ApproverOption[]>([]);

  const filteredSetups = setups.filter((setup) =>
    setup.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  const initializeStages = (count: number) => {
    const newStages: ApprovalStage[] = Array.from({ length: count }, (_, idx) => ({
      name: "",
      quorum: 1,
      approvers: [],
      mandatoryApprovers: [],
      scope: idx === 0 ? "BRANCH" : "HEAD_OFFICE",
      isRequired: idx === 0, // default Stage 1 as required
      thresholdAmount: 0,
    }));
    setStages(newStages);
  };

  const handleAddNew = () => {
    setEditingSetup(null);
    setCurrentStep(0);
    setDocumentType("");
    setNumberOfStages(1);
    setNumberOfStagesInput("1");
    initializeStages(1);
    setIsAsideOpen(true);
  };

  const handleEdit = (setup: ApprovalSetup) => {
    setEditingSetup(setup);
    setCurrentStep(0);
    setDocumentType(setup.doctype_id.toString());
    setNumberOfStages(setup.approval_stages);
    setNumberOfStagesInput(setup.approval_stages.toString());

    let parsedDetails: Array<{
      name: string;
      quorum: string;
      scope?: "BRANCH" | "HEAD_OFFICE";
      isRequired?: boolean;
      is_required?: boolean;
      thresholdAmount?: number;
      threshold_amount?: number;
      approvers: Array<{ userId: number; name: string; isMandatory: boolean }>;
    }> = [];

    try {
      if (typeof setup.details === "string") {
        parsedDetails = JSON.parse(setup.details);
      } else if (Array.isArray(setup.details)) {
        parsedDetails = setup.details;
      }
    } catch (parseErr) {
      console.error("Failed to parse approval stages details:", parseErr);
    }

    const transformedStages: ApprovalStage[] = parsedDetails.map((detail, idx) => ({
      name: detail.name || "",
      quorum: Number(detail.quorum) || 1,
      approvers: detail.approvers?.map((a) => a.name) ?? [],
      mandatoryApprovers: detail.approvers
        ?.filter((a) => a.isMandatory)
        .map((a) => a.name) ?? [],
      scope: detail.scope || (idx === 0 ? "BRANCH" : "HEAD_OFFICE"),
      isRequired: detail.isRequired !== undefined ? Boolean(detail.isRequired) : detail.is_required !== undefined ? Boolean(detail.is_required) : (idx === 0),
      thresholdAmount: Number(detail.thresholdAmount || detail.threshold_amount) || (idx + 1) * 10000,
    }));

    setStages(transformedStages);
    setIsAsideOpen(true);
  };

  const handleView = (setup: ApprovalSetup) => {
    setViewingSetup(setup);
    setIsViewOpen(true);
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
      if (stages.length === 0 && numberOfStages > 0) {
        initializeStages(numberOfStages);
      }
    }

    if (currentStep > 0) {
      const stageIndex = currentStep - 1;
      const stage = stages[stageIndex];
      if (!stage.name) {
        toast({
          title: "Validation Error",
          description: "Please enter a stage name.",
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

  const handleSaveAll = async () => {
    const lastStageIndex = currentStep - 1;
    const lastStage = stages[lastStageIndex];
    if (!lastStage?.name) {
      toast({
        title: "Validation Error",
        description: "Please complete all stage name fields.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      posted_by: currentUser?.user_id || 1,
      doctype_id: documentType,
      stages: stages.map((stage, idx) => ({
        name: stage.name,
        scope: idx === 0 ? "BRANCH" : "HEAD_OFFICE",
        isRequired: idx === 0 ? true : stage.isRequired,
        threshold_amount: 0,
        approvers: [],
      })),
    };

    try {
      if (editingSetup) {
        await api.put("/update-doc-approvers-setup", payload);
        toast({
          title: "Approval Setup Updated",
          description: `${documentType} workflow has been updated.`,
        });
      } else {
        await api.post("/create-doc-approvers-setup", payload);
        toast({ title: "Success", description: "Approval setup created." });
      }

      await fetchApprovalSetups();
      setIsAsideOpen(false);
    } catch (err: unknown) {
      console.error("Error saving approval setup:", err);
      toast({
        title: "Error",
        description: getErrorMessage(err, "Failed to save approval setup. Please try again."),
        variant: "destructive",
      });
    }
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

    if (!isMandatory && stage.mandatoryApprovers.length >= stage.quorum) {
      toast({
        title: "Cannot Add Mandatory Approver",
        description: `Mandatory approvers cannot exceed quorum (${stage.quorum}).`,
        variant: "destructive",
      });
      return;
    }

    updateStage(stageIndex, {
      mandatoryApprovers: isMandatory
        ? stage.mandatoryApprovers.filter((a) => a !== approverName)
        : [...stage.mandatoryApprovers, approverName],
    });
  };

  // Fetch available document types
  useEffect(() => {
    const fetchAvailableDocumentTypes = async () => {
      try {
        const res = await api.get<{ documents: DocumentType[] }>("/get-available-doc-types");
        let availableTypes = res.data.documents;

        if (editingSetup && !availableTypes.some((t) => t.id === editingSetup.doctype_id.toString())) {
          availableTypes = [
            {
              id: editingSetup.doctype_id.toString(),
              description: editingSetup.description,
              trans_type: "",
            },
            ...availableTypes,
          ];
        }

        setAvailableDocumentTypes(availableTypes);
      } catch (err: unknown) {
        console.error("Failed to fetch available document types:", err);
        toast({
          title: "Warning",
          description: getErrorMessage(err, "Could not load available document types."),
          variant: "destructive",
        });
      }
    };

    fetchAvailableDocumentTypes();
  }, [editingSetup, toast]);

  // Fetch approvers
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const res = await api.get<{ approvers: ApproverOption[] }>("/get-approver-users");
        setAvailableApprovers(res.data.approvers);
      } catch (err: unknown) {
        console.error("Failed to fetch approvers:", err);
        toast({
          title: "Warning",
          description: getErrorMessage(err, "Could not load approvers list."),
          variant: "destructive",
        });
      }
    };

    fetchApprovers();
  }, [toast]);

  // Fetch approval setups – wrapped in useCallback to stabilize reference
  const fetchApprovalSetups = useCallback(async () => {
    try {
      const res = await api.get<{ setups: ApprovalSetup[] }>("/get-approver-setups");
      const sorted = [...(res.data.setups || [])].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
      setSetups(sorted);
    } catch (err: unknown) {
      console.error("Failed to fetch approval setups:", err);
      toast({
        title: "Error",
        description: getErrorMessage(err, "Could not load approval setups."),
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchApprovalSetups();
  }, [fetchApprovalSetups]);

  const columns: Column<ApprovalSetup>[] = [
    { key: "id", header: "ID", className: "w-20" },
    {
      key: "description",
      header: "Document Type",
      render: (setup) => <span className="capitalize">{setup.description}</span>,
    },
    {
      key: "stages",
      header: "Approval Stages",
      render: (setup) => (
        <Badge variant="secondary" className="text-xs">
          {setup.approval_stages} Stage{setup.approval_stages > 1 ? "s" : ""}
        </Badge>
      ),
    },
    {
      key: "approversCount",
      header: "Approvers",
      render: (setup) => <span className="text-xs">{setup.number_of_approvers}</span>,
    },
    {
      key: "requiredApproversCount",
      header: "Required",
      render: (setup) => <span className="text-xs">{setup.mandatory_approvers}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (setup) => (
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                  onClick={() => handleEdit(setup)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                  onClick={() => handleView(setup)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  const totalSteps = numberOfStages + 1;

  return (
    <div className="space-y-4">
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

      <div className="rounded-lg border border-border bg-card">
        <DataTable
          data={filteredSetups}
          columns={columns}
          keyExtractor={(setup) => String(setup.id)}
          emptyMessage="No approval setups found"
        />
      </div>

      {/* Right Aside - Wizard */}
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
                    {availableDocumentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id} className="capitalize">
                        {type.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {documentType && (
                  <p className="text-xs text-muted-foreground capitalize">
                    Selected: {availableDocumentTypes.find((t) => t.id === documentType)?.description}
                  </p>
                )}
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
                  value={numberOfStagesInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setNumberOfStagesInput(raw);

                    if (raw === "") return;

                    const parsed = parseInt(raw, 10);
                    if (!isNaN(parsed)) {
                      const val = Math.min(10, Math.max(1, parsed));
                      setNumberOfStages(val);

                      if (editingSetup) {
                        setStages((prevStages) => {
                          if (val > prevStages.length) {
                            const newStages = Array.from({ length: val - prevStages.length }, (_, idx) => ({
                              name: "",
                              quorum: 1,
                              approvers: [],
                              mandatoryApprovers: [],
                              scope: "HEAD_OFFICE" as const,
                              isRequired: false,
                              thresholdAmount: 0,
                            }));
                            return [...prevStages, ...newStages];
                          } else if (val < prevStages.length) {
                            return prevStages.slice(0, val);
                          }
                          return prevStages;
                        });
                      } else {
                        initializeStages(val);
                      }
                    }
                  }}
                  onBlur={() => {
                    if (numberOfStagesInput === "" || isNaN(parseInt(numberOfStagesInput, 10)) || parseInt(numberOfStagesInput, 10) < 1) {
                      setNumberOfStagesInput("1");
                      setNumberOfStages(1);
                      if (!editingSetup) initializeStages(1);
                    } else {
                      const clamped = Math.min(10, Math.max(1, parseInt(numberOfStagesInput, 10)));
                      setNumberOfStagesInput(clamped.toString());
                      setNumberOfStages(clamped);
                    }
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

              <div className="space-y-2">
                <Label htmlFor="stageName" className="text-xs font-medium">
                  Stage Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stageName"
                  value={stages[currentStep - 1].name}
                  onChange={(e) => updateStage(currentStep - 1, { name: e.target.value })}
                  placeholder={currentStep === 1 ? "e.g., Branch Operations Review" : `e.g., Head Office Tier ${currentStep - 1} Approval`}
                  className="h-9 font-medium"
                />
              </div>

              {/* Universal isRequired Toggle Card */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="stage-is-required" className="text-xs font-bold text-foreground cursor-pointer">
                        Mandatory Stage (isRequired)
                      </Label>
                      {currentStep === 1 && (
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 font-semibold">
                          Compulsory for Stage 1
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {currentStep === 1
                        ? "Stage 1 is compulsory and all documents must originate through this stage."
                        : "If enabled, documents MUST stop for approval at this stage regardless of amount."}
                    </p>
                  </div>
                  <Switch
                    id="stage-is-required"
                    checked={currentStep === 1 ? true : stages[currentStep - 1].isRequired}
                    disabled={currentStep === 1}
                    onCheckedChange={(checked) => {
                      if (currentStep > 1) {
                        updateStage(currentStep - 1, { isRequired: checked });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Dynamic Branch / Head Office Routing Info Banner */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dynamic Approver Routing</span>
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {currentStep === 1
                    ? "Stage 1 routes dynamically to all active approvers in the document's originating branch."
                    : "Stage " + currentStep + " escalates to Head Office approvers ordered by ascending signing limit."}
                </p>
              </div>
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

      {/* View Aside */}
      <RightAside
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="View Approval Setup"
        subtitle={viewingSetup ? viewingSetup.description : ""}
      >
        {viewingSetup && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">ID</span>
                <span className="text-xs font-medium">{viewingSetup.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Document Type</span>
                <span className="text-xs font-medium capitalize">{viewingSetup.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Total Approvers</span>
                <span className="text-xs font-medium">{viewingSetup.number_of_approvers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Required Approvers</span>
                <span className="text-xs font-medium">{viewingSetup.mandatory_approvers}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-medium">Approval Stages</Label>

              {(() => {
                let detailsArray: Array<{
                  name: string;
                  quorum: string;
                  scope?: string;
                  isRequired?: boolean;
                  is_required?: boolean;
                  thresholdAmount?: number;
                  threshold_amount?: number;
                  approvers: Array<{ userId: number; name: string; isMandatory: boolean }>;
                }> = [];

                try {
                  if (typeof viewingSetup.details === "string") {
                    detailsArray = JSON.parse(viewingSetup.details);
                  } else if (Array.isArray(viewingSetup.details)) {
                    detailsArray = viewingSetup.details;
                  }
                } catch (parseErr) {
                  console.error("Error parsing details for view:", parseErr);
                }

                return detailsArray.map((stage, index) => {
                  const isReq = stage.isRequired || stage.is_required;
                  const scp = stage.scope || (index === 0 ? "BRANCH" : "HEAD_OFFICE");
                  const thresh = stage.thresholdAmount || stage.threshold_amount;

                  return (
                    <div key={index} className="rounded-lg border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                            {index + 1}
                          </div>
                          <span className="text-xs font-semibold">{stage.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {scp}
                          </Badge>
                          {isReq && (
                            <Badge variant="destructive" className="text-[10px]">
                              Mandatory
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="pl-8 space-y-1">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                          <span>Quorum: {stage.quorum}</span>
                          {thresh !== undefined && <span>Threshold: GHS {Number(thresh).toLocaleString()}</span>}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {stage.approvers.map((approver) => (
                            <Badge
                              key={approver.userId}
                              variant={approver.isMandatory ? "default" : "secondary"}
                              className="text-[10px] capitalize"
                            >
                              {approver.name}
                              {approver.isMandatory && " *"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </RightAside>
    </div>
  );
}