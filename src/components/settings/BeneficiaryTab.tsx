/**
 * BeneficiaryTab Component
 * ========================
 * Settings tab for managing beneficiaries with real backend integration.
 */

import { useState, useEffect } from "react";
import { Plus, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ActionMenu } from "@/components/shared/ActionMenu";
import { RightAside } from "@/components/shared/RightAside";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────

interface RawBeneficiary {
  id: number;
  beneficiary_name: string;
  account_number: string;
  description: string | null;
  status: string | number;     // ← accept both string "1"/"0" and number
  posted_by?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

interface DisplayBeneficiary {
  id: number;
  name: string;
  accountNumber: string;
  description: string;
  status: "Active" | "Inactive";
}

export function BeneficiaryTab() {
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const [beneficiaries, setBeneficiaries] = useState<DisplayBeneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Aside / Form
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<DisplayBeneficiary | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("Active");

  const MAX_DESCRIPTION_LENGTH = 255;

  // ────────────────────────────────────────────────
  //  Fetch all beneficiaries
  // ────────────────────────────────────────────────

  const loadBeneficiaries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/get-all-beneficiary-accounts");
      const raw: RawBeneficiary[] = res.data.accounts || [];

// 1. In loadBeneficiaries – improved mapping with type safety
const mapped = raw.map((b) => {
  // Normalize status (handles both string "1"/"0" and number)
  const statusValue = typeof b.status === 'string' ? parseInt(b.status, 10) : b.status;
  const displayStatus = statusValue === 1 ? 'Active' : 'Inactive' as const; // ← key fix

return {
  id: b.id,
  name: b.beneficiary_name,
  accountNumber: b.account_number,
  description: b.description || "",
  status: statusValue === 1 ? "Active" : "Inactive",
} satisfies DisplayBeneficiary;    // or use as DisplayBeneficiary
});

      setBeneficiaries(mapped);
    } catch (err: unknown) {
  console.error("Failed to load beneficiaries:", err);
  toast({
    title: "Error",
    description: "Could not load beneficiaries.",
    variant: "destructive",
  });
} finally {
  setLoading(false);
}
  };

  useEffect(() => {
    loadBeneficiaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← added comment to silence exhaustive-deps warning (function is stable)

  // ────────────────────────────────────────────────
  //  Filtering
  // ────────────────────────────────────────────────

  const filteredBeneficiaries = beneficiaries.filter((ben) => {
    const searchLower = searchValue.toLowerCase().trim();
    const matchesSearch =
      ben.name.toLowerCase().includes(searchLower) ||
      ben.accountNumber.includes(searchLower) ||
      String(ben.id).includes(searchLower);
    const matchesStatus = statusFilter === "all" || ben.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ────────────────────────────────────────────────
  //  Handlers
  // ────────────────────────────────────────────────

  const handleAddNew = () => {
    setEditingBeneficiary(null);
    setName("");
    setAccountNumber("");
    setDescription("");
    setStatus("Active");
    setIsAsideOpen(true);
  };

  const handleEdit = (ben: DisplayBeneficiary) => {
    setEditingBeneficiary(ben);
    setName(ben.name);
    setAccountNumber(ben.accountNumber);
    setDescription(ben.description);
    setStatus(ben.status);
    setIsAsideOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !accountNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Beneficiary name and account number are required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      beneficiary_name: name.trim(),
      account_number: accountNumber.trim(),
      description: description.trim() || null,
      status: status === "Active" ? 1 : 0,
      posted_by: currentUser?.user_id || 1,
    };

    if (editingBeneficiary) {
      payload.id = editingBeneficiary.id;
    }

    try {
      if (editingBeneficiary) {
        // Using the route as-is (body contains id)
        await api.put("/update-beneficiary-account", payload);
        toast({ title: "Success", description: "Beneficiary updated." });
      } else {
        await api.post("/add-beneficiary-account", payload);
        toast({ title: "Success", description: "Beneficiary created." });
      }

      await loadBeneficiaries();
      setIsAsideOpen(false);
    } catch (err: unknown) {
  console.error("Save failed:", err);

  let msg = editingBeneficiary
    ? "Failed to update beneficiary."
    : "Failed to create beneficiary.";

  // Safe narrowing
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosError = err as { response?: { data?: { message?: string } } };
    msg = axiosError.response?.data?.message || msg;
  }

  toast({
    title: "Error",
    description: msg,
    variant: "destructive",
  });
} finally {
  setSaving(false);
}
  };

  const columns: Column<DisplayBeneficiary>[] = [
    { key: "id", header: "ID", className: "w-20" },
    { key: "name", header: "Beneficiary Name" },
    { key: "accountNumber", header: "Account Number", hideOnMobile: true },
    { key: "description", header: "Description", hideOnMobile: true },
    {
      key: "status",
      header: "Status",
      render: (ben) => <StatusBadge status={ben.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (ben) => (
        <ActionMenu
          actions={[
            {
              label: "Edit",
              icon: <Edit2 className="h-3 w-3" />,
              onClick: () => handleEdit(ben),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SearchFilter
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search beneficiaries..."
          filters={[
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "all", label: "All Status" },
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ],
            },
          ]}
        />
        <Button onClick={handleAddNew} size="sm" className="ml-3 shrink-0">
          <Plus className="h-4 w-4 mr-1" />
          Add New
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <DataTable
          data={filteredBeneficiaries}
          columns={columns}
          keyExtractor={(ben) => ben.id.toString()}
          emptyMessage={loading ? "Loading beneficiaries..." : "No beneficiaries found"}
          isLoading={loading}
        />
      </div>

      {/* Right Aside */}
      <RightAside
        isOpen={isAsideOpen}
        onClose={() => setIsAsideOpen(false)}
        title={editingBeneficiary ? "Edit Beneficiary" : "Add New Beneficiary"}
        subtitle={
          editingBeneficiary
            ? `Editing ${editingBeneficiary.name}`
            : "Create a new beneficiary"
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-medium">
              Beneficiary Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter beneficiary name"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-xs font-medium">
              Account Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-xs font-medium">
                Description
              </Label>
              <span className="text-[10px] text-muted-foreground">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
              placeholder="Enter description (optional)"
              className="min-h-[80px] text-sm resize-none"
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs font-medium">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="h-9">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={saving || loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving
                ? "Saving..."
                : editingBeneficiary
                ? "Update Beneficiary"
                : "Save Beneficiary"}
            </Button>
          </div>
        </div>
      </RightAside>
    </div>
  );
}