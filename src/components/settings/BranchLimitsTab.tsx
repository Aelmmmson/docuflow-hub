/**
 * BranchLimitsTab Component
 * =========================
 * Settings tab for managing global branch approval limits across all document types.
 */

import { useState, useEffect } from "react";
import { Building2, Save, RefreshCw, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export interface BranchLimitItem {
  id: number;
  branch_id: string;
  branch_name: string;
  approval_limit: number;
  currency: string;
  updated_at?: string;
  updated_by?: string;
}

export function BranchLimitsTab() {
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  const [limits, setLimits] = useState<BranchLimitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingBranchId, setSavingBranchId] = useState<string | null>(null);
  const [editedLimits, setEditedLimits] = useState<Record<string, string>>({});

  const fetchBranchLimits = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ limits: BranchLimitItem[] }>("/get-branch-approval-limits");
      const list = res.data?.limits || [];
      setLimits(list);

      const initialEdited: Record<string, string> = {};
      list.forEach((item) => {
        initialEdited[String(item.branch_id)] = item.approval_limit !== null && item.approval_limit !== undefined ? String(item.approval_limit) : "";
      });
      setEditedLimits(initialEdited);
    } catch (err) {
      console.error("Failed to fetch branch approval limits:", err);
      toast({
        title: "Error Loading Limits",
        description: getErrorMessage(err, "Could not load branch approval limits."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchLimits();
  }, []);

  const handleLimitChange = (branchId: string, val: string) => {
    setEditedLimits((prev) => ({ ...prev, [branchId]: val }));
  };

  const handleSaveLimit = async (branch: BranchLimitItem) => {
    const branchId = String(branch.branch_id);
    const newLimitVal = parseFloat(editedLimits[branchId] || "0");

    if (isNaN(newLimitVal) || newLimitVal < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive limit amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingBranchId(branchId);
      await api.put("/update-branch-approval-limit", {
        branch_id: branchId,
        branch_name: branch.branch_name,
        approval_limit: newLimitVal,
        currency: "",
        posted_by: currentUser?.email || "admin",
      });

      toast({
        title: "Limit Updated",
        description: `${branch.branch_name} limit set to ${newLimitVal.toLocaleString()}.`,
      });

      fetchBranchLimits();
    } catch (err) {
      console.error("Failed to update branch limit:", err);
      toast({
        title: "Update Failed",
        description: getErrorMessage(err, "Failed to save branch limit."),
        variant: "destructive",
      });
    } finally {
      setSavingBranchId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informational Banner */}
      <Alert className="border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200">
        <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <div className="space-y-1">
          <AlertTitle className="text-xs font-bold">Global Branch Approval Thresholds</AlertTitle>
          <AlertDescription className="text-xs">
            These limits determine when a document originated at a branch can be finalized locally vs when it must escalate to Head Office tiers. Changing a branch's limit applies globally across all document types.
          </AlertDescription>
        </div>
      </Alert>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center p-8 text-xs text-muted-foreground animate-pulse gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading branch limits...
        </div>
      ) : limits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          No branches found in system parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {limits.map((item) => {
            const bId = String(item.branch_id);
            const isSaving = savingBranchId === bId;
            const isUnconfigured = item.approval_limit === null || item.approval_limit === undefined || Number(item.approval_limit) === 0;
            const isEdited = editedLimits[bId] !== undefined && parseFloat(editedLimits[bId]) !== Number(item.approval_limit);

            return (
              <div
                key={bId}
                className={cn(
                  "rounded-xl bg-card border p-4 shadow-sm space-y-4 hover:shadow-md transition-shadow",
                  isUnconfigured ? "border-destructive/40 bg-destructive/5" : "border-border"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      <span>{item.branch_name || `Branch ${bId}`}</span>
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono">ID: {bId}</span>
                  </div>
                  {isUnconfigured ? (
                    <Badge variant="destructive" className="text-[10px] animate-pulse">
                      Limit Required
                    </Badge>
                  ) : (
                    <Badge variant={isEdited ? "secondary" : "outline"} className="text-[10px]">
                      {isEdited ? "Unsaved Edit" : "Active"}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-medium">Approval Limit</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="1000"
                      min="0"
                      placeholder="Enter limit amount..."
                      value={editedLimits[bId] ?? (item.approval_limit !== null && item.approval_limit !== undefined ? String(item.approval_limit) : "")}
                      onChange={(e) => handleLimitChange(bId, e.target.value)}
                      className="font-mono font-bold text-sm h-10"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">
                    {item.updated_by ? `Updated by ${item.updated_by}` : (isUnconfigured ? "Not Configured" : "Configured")}
                  </span>
                  <Button
                    size="sm"
                    className="h-8 text-xs font-semibold"
                    disabled={isSaving}
                    onClick={() => handleSaveLimit(item)}
                  >
                    {isSaving ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <Save className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span>{isSaving ? "Saving..." : "Save Limit"}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
