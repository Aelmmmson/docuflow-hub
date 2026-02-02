/**
 * ApprovalSetupTab Component
 * ==========================
 * Settings tab for managing document approval workflows with multi-stage wizard.
 */

import { useState,useEffect } from "react";
import { Plus, Edit2, Save, ChevronLeft, ChevronRight, Check, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { SearchFilter } from "@/components/shared/SearchFilter";
import { DataTable, Column } from "@/components/shared/DataTable";
import { RightAside } from "@/components/shared/RightAside";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

interface ApprovalStage {
  name: string;
  quorum: number;
  approvers: string[];
  mandatoryApprovers: string[];
}

interface DocumentType {
  id: string;
  description: string;
  trans_type:string;
}

interface ApprovalSetup {
  approval_stages: number;
  id: number;
  description: string,
  doctype_id: number,
  number_of_approvers: number,
  mandatory_approvers: number,
  details: string | {name: string; quorum: string; approvers: {userId: number; name: string; isMandatory: boolean}[] }[];
}

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

  const currentUser = getCurrentUser();
  const { toast } = useToast();
  const [setups, setSetups] = useState<ApprovalSetup[]>([]);
  const [searchValue, setSearchValue] = useState("");

  // Aside state
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [editingSetup, setEditingSetup] = useState<ApprovalSetup | null>(null);

  // View aside state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingSetup, setViewingSetup] = useState<ApprovalSetup | null>(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0); // 0 = config, 1+ = stages
  const [documentType, setDocumentType] = useState("");
  const [availableDocumentTypes, setAvailableDocumentTypes] = useState<DocumentType[]>([]);
  const [numberOfStages, setNumberOfStages] = useState(1);
  const [stages, setStages] = useState<ApprovalStage[]>([]);

  //for approvers
  const [availableApprovers, setAvailableApprovers] = useState<{ userId: string; name: string }[]>([]);

  const filteredSetups = setups.filter((setup) =>
    setup.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  const initializeStages = (count: number) => {
    const newStages: ApprovalStage[] = Array.from({ length: count }, () => ({
      name: "",
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
    setStages([{ name: "", quorum: 1, approvers: [], mandatoryApprovers: [] }]);
    setIsAsideOpen(true);
  };

  const handleEdit = (setup: ApprovalSetup) => {
    console.log("Editing setup:", setup);
    console.log("Setup details:", setup.details);
    console.log("Details type:", typeof setup.details);
    
    setEditingSetup(setup);
    setCurrentStep(0);
    // Set documentType to the ID (as a string) to match the Select component's value format
    setDocumentType(setup.doctype_id.toString());
    setNumberOfStages(setup.approval_stages);
    
    // Parse details if it's a string, otherwise use as-is
    let detailsArray: any[] = [];
    try {
      if (typeof setup.details === 'string') {
        detailsArray = JSON.parse(setup.details);
      } else if (Array.isArray(setup.details)) {
        detailsArray = setup.details;
      }
    } catch (error) {
      console.error("Error parsing details:", error);
      detailsArray = [];
    }
    
    console.log("Parsed details array:", detailsArray);
    
    // Transform details array into ApprovalStage format with proper null checks
    const transformedStages: ApprovalStage[] = detailsArray.map((detail) => {
      const approvers = Array.isArray(detail.approvers) ? detail.approvers : [];
      
      return {
        name: detail.name || "",
        quorum: parseInt(detail.quorum) || 1,
        approvers: approvers.map((approver) => approver.name),
        mandatoryApprovers: approvers
          .filter((approver) => approver.isMandatory)
          .map((approver) => approver.name),
      };
    });
    
    console.log("Transformed stages:", transformedStages);
    setStages(transformedStages);
    setIsAsideOpen(true);
  };

  const handleView = (setup: ApprovalSetup) => {
    setViewingSetup(setup);
    setIsViewOpen(true);
  };

  const handleNextStep = () => {
    console.log("Current step:", currentStep);
    console.log("Stages array:", stages);
    console.log("Number of stages:", numberOfStages);
    
    if (currentStep === 0) {
      if (!documentType) {
        toast({
          title: "Validation Error",
          description: "Please select a document type.",
          variant: "destructive",
        });
        return;
      }
      // Initialize stages if needed - only if stages are empty (adding new, not editing)
      if (stages.length === 0 && numberOfStages > 0) {
        initializeStages(numberOfStages);
      }
    }
    
    if (currentStep > 0) {
      const stageIndex = currentStep - 1;
      const stage = stages[stageIndex];
      console.log(`Stage ${stageIndex}:`, stage);
      if (!stage.name) {
        toast({
          title: "Validation Error",
          description: "Please enter a stage name.",
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
      // Validate mandatory approvers do not exceed quorum
      if (stage.mandatoryApprovers.length > stage.quorum) {
        toast({
          title: "Validation Error",
          description: "Mandatory approvers cannot exceed the quorum number.",
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

  const handleSaveAll = async () =>  {
    // Validate last stage
    const lastStageIndex = currentStep - 1;
    const lastStage = stages[lastStageIndex];
    if (!lastStage?.name || lastStage.approvers.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please complete all stage fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate mandatory approvers for last stage
    if (lastStage.mandatoryApprovers.length > lastStage.quorum) {
      toast({
        title: "Validation Error",
        description: "Mandatory approvers cannot exceed the quorum number.",
        variant: "destructive",
      });
      return;
    }

    const totalApprovers = stages.reduce((acc, s) => acc + s.approvers.length, 0);
    const totalMandatory = stages.reduce((acc, s) => acc + s.mandatoryApprovers.length, 0);

    const payload = {
      posted_by: currentUser?.user_id || 1,
      doctype_id: documentType,
      stages: stages.map((stage) => ({
        name: stage.name,
        quorum: stage.quorum.toString(),
        approvers: stage.approvers.map((approverName) => {
          // Find the approver object from availableApprovers
          const approver = availableApprovers.find((a) => a.name === approverName);
          return {
            userId: parseInt(approver?.userId || "0"),
            name: approverName,
            isMandatory: stage.mandatoryApprovers.includes(approverName),
          };
        }),
      })),
    };

    console.log("Payload to save:", payload);
    
    try {
      if (editingSetup) {
        // If editing, include the setup ID in the payload and use update endpoint
        await api.put(`/update-doc-approvers-setup`, { ...payload });
        toast({
          title: "Approval Setup Updated",
          description: `${documentType} workflow has been updated.`,
        });
      } else {
        await api.post("/create-doc-approvers-setup", payload);
        toast({ title: "Success", description: "Approval setup created." });
      }

      // Refetch the setups to get updated data
      await fetchApprovalSetups();
      setIsAsideOpen(false);
    } catch (error) {
      console.error("Error saving approval setup:", error);
      toast({
        title: "Error",
        description: "Failed to save approval setup. Please try again.",
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
    
    // Check if adding would exceed quorum
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

  //get available document types excluding the ones already used
  useEffect(() => {
    const fetchAvailableDocumentTypes = async () => {
      try {
        const availableDoctypesRes = await api.get<{ documents: DocumentType[] }>("/get-available-doc-types");
        let availableTypes = availableDoctypesRes.data.documents;
        
        // If editing, ensure the current document type is included
        if (editingSetup && !availableTypes.find((t) => t.id === editingSetup.doctype_id.toString())) {
          availableTypes = [
            { id: editingSetup.doctype_id.toString(), description: editingSetup.description, trans_type: "" },
            ...availableTypes,
          ];
        }
        
        setAvailableDocumentTypes(availableTypes);
      } catch (err) {
        console.error("Failed to fetch available document types:", err);
      }
    };

    fetchAvailableDocumentTypes();
  }, [setups, editingSetup]);


  //get approvers from api
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const approversRes = await api.get<{ approvers: { userId: string; name: string }[] }>("/get-approver-users");
        const approversData = approversRes.data.approvers;
        setAvailableApprovers(approversData);
      } catch (err) {
        console.error("Failed to fetch approvers:", err);
      }
    };
    fetchApprovers();
  }, []);


  //get doc approval setups from api
  const fetchApprovalSetups = async () => {
      try {
        const setupsRes = await api.get<{ setups: ApprovalSetup[] }>("/get-approver-setups");
        const setupsData = setupsRes.data.setups;
        setSetups(setupsData);
      } catch (err) {
        console.error("Failed to fetch approval setups:", err);
      }
  };

  useEffect(() => {
    fetchApprovalSetups();
  }, []);



  const columns: Column<ApprovalSetup>[] = [
    { key: "id", header: "ID", className: "w-20" },
    { 
      key: "description",
      header: "Document Type",
      render: (setup) => <span>{setup.description}</span>
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
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
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
                  className="h-8 w-8"
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
                    {availableDocumentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {documentType && (
                  <p className="text-xs text-muted-foreground">
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
                  value={numberOfStages}
                  onChange={(e) => {
                    const val = Math.min(10, Math.max(1, parseInt(e.target.value) || 1));
                    setNumberOfStages(val);
                    
                    // Handle stage array adjustments
                    if (editingSetup) {
                      // When editing, adjust the stages array based on new count
                      setStages((prevStages) => {
                        if (val > prevStages.length) {
                          // Add new empty stages
                          const newStages = Array.from({ length: val - prevStages.length }, () => ({
                            name: "",
                            quorum: 1,
                            approvers: [],
                            mandatoryApprovers: [],
                          }));
                          return [...prevStages, ...newStages];
                        } else if (val < prevStages.length) {
                          // Remove extra stages
                          return prevStages.slice(0, val);
                        }
                        return prevStages;
                      });
                    } else {
                      // When adding new, initialize fresh stages
                      initializeStages(val);
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

              {/* Stage Description */}
              <div className="space-y-2">
                <Label htmlFor="stageName" className="text-xs font-medium">
                  Stage Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stageName"
                  value={stages[currentStep - 1].name}
                  onChange={(e) => updateStage(currentStep - 1, { name: e.target.value })}
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
                    const stage = stages[currentStep - 1];
                    // If reducing quorum below mandatory count, trim mandatory approvers
                    if (val < stage.mandatoryApprovers.length) {
                      updateStage(currentStep - 1, { 
                        quorum: val,
                        mandatoryApprovers: stage.mandatoryApprovers.slice(0, val)
                      });
                    } else {
                      updateStage(currentStep - 1, { quorum: val });
                    }
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
                  {availableApprovers.map((approver) => {
                    const isSelected = stages[currentStep - 1].approvers.includes(approver.name);
                    return (
                      <div
                        key={approver.userId}
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
                  
                  {/* Alert when approaching/at quorum limit */}
                  {stages[currentStep - 1].mandatoryApprovers.length >= stages[currentStep - 1].quorum && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">
                        Mandatory approvers cannot exceed quorum ({stages[currentStep - 1].quorum}).
                        {stages[currentStep - 1].mandatoryApprovers.length === stages[currentStep - 1].quorum && " Maximum reached."}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="border border-border rounded-lg p-3 space-y-2">
                    {stages[currentStep - 1].approvers.map((approverName) => {
                      const isMandatory = stages[currentStep - 1].mandatoryApprovers.includes(approverName);
                      const isDisabled = !isMandatory && stages[currentStep - 1].mandatoryApprovers.length >= stages[currentStep - 1].quorum;
                      return (
                        <div key={approverName} className={cn("flex items-center gap-2", isDisabled && "opacity-50")}>
                          <Checkbox
                            id={`mandatory-${approverName}`}
                            checked={isMandatory}
                            disabled={isDisabled}
                            onCheckedChange={() => toggleMandatory(currentStep - 1, approverName)}
                          />
                          <Label
                            htmlFor={`mandatory-${approverName}`}
                            className={cn("text-xs font-normal", isDisabled ? "cursor-not-allowed" : "cursor-pointer")}
                          >
                            {approverName}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Selected: {stages[currentStep - 1].mandatoryApprovers.length} / {stages[currentStep - 1].quorum} (max)
                  </p>
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

      {/* View Aside */}
      <RightAside
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="View Approval Setup"
        subtitle={viewingSetup ? viewingSetup.description : ""}
      >
        {viewingSetup && (() => {
          // Parse details if it's a string
          let detailsArray: any[] = [];
          try {
            if (typeof viewingSetup.details === 'string') {
              detailsArray = JSON.parse(viewingSetup.details);
            } else if (Array.isArray(viewingSetup.details)) {
              detailsArray = viewingSetup.details;
            }
          } catch (error) {
            console.error("Error parsing details for view:", error);
            detailsArray = [];
          }
          
          return (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">ID</span>
                  <span className="text-xs font-medium">{viewingSetup.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Document Type</span>
                  <span className="text-xs font-medium">{viewingSetup.description}</span>
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
                {detailsArray.map((stage, index) => (
                  <div key={index} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                        {index + 1}
                      </div>
                      <span className="text-xs font-medium">{stage.name}</span>
                    </div>
                    <div className="pl-8 space-y-1">
                      <p className="text-[10px] text-muted-foreground">Quorum: {stage.quorum}</p>
                      <div className="flex flex-wrap gap-1">
                        {stage.approvers.map((approver: any) => (
                          <Badge 
                            key={approver.userId} 
                            variant={approver.isMandatory ? "default" : "secondary"} 
                            className="text-[10px]"
                          >
                            {approver.name}
                            {approver.isMandatory && " *"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </RightAside>
    </div>
  );
}