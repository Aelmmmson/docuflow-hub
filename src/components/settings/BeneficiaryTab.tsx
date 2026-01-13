/**
 * BeneficiaryTab Component
 * ========================
 * Settings tab for managing beneficiaries.
 */

import { useState } from "react";
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

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  description: string;
  status: "Active" | "Inactive";
}

// Mock data
const mockBeneficiaries: Beneficiary[] = [
  { id: "BEN001", name: "ABC Electric Co.", accountNumber: "1234567890", description: "Primary electricity provider", status: "Active" },
  { id: "BEN002", name: "Daily News Ltd.", accountNumber: "0987654321", description: "Newspaper subscription", status: "Active" },
  { id: "BEN003", name: "Travel Express Inc.", accountNumber: "5678901234", description: "Corporate travel services", status: "Active" },
  { id: "BEN004", name: "Office Mart", accountNumber: "4321098765", description: "Office supplies vendor", status: "Inactive" },
  { id: "BEN005", name: "Tech Solutions", accountNumber: "6789012345", description: "IT equipment supplier", status: "Active" },
];

export function BeneficiaryTab() {
  const { toast } = useToast();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(mockBeneficiaries);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Aside state
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("Active");

  const MAX_DESCRIPTION_LENGTH = 255;

  const filteredBeneficiaries = beneficiaries.filter((ben) => {
    const matchesSearch =
      ben.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      ben.accountNumber.includes(searchValue) ||
      ben.id.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === "all" || ben.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddNew = () => {
    setEditingBeneficiary(null);
    setName("");
    setAccountNumber("");
    setDescription("");
    setStatus("Active");
    setIsAsideOpen(true);
  };

  const handleEdit = (ben: Beneficiary) => {
    setEditingBeneficiary(ben);
    setName(ben.name);
    setAccountNumber(ben.accountNumber);
    setDescription(ben.description);
    setStatus(ben.status);
    setIsAsideOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !accountNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingBeneficiary) {
      // Update existing
      setBeneficiaries((prev) =>
        prev.map((b) =>
          b.id === editingBeneficiary.id
            ? {
                ...b,
                name,
                accountNumber,
                description,
                status: status as Beneficiary["status"],
              }
            : b
        )
      );
      toast({
        title: "Beneficiary Updated",
        description: `${name} has been updated successfully.`,
      });
    } else {
      // Add new
      const newBeneficiary: Beneficiary = {
        id: `BEN${String(beneficiaries.length + 1).padStart(3, "0")}`,
        name,
        accountNumber,
        description,
        status: status as Beneficiary["status"],
      };
      setBeneficiaries((prev) => [...prev, newBeneficiary]);
      toast({
        title: "Beneficiary Added",
        description: `${name} has been added successfully.`,
      });
    }

    setIsAsideOpen(false);
  };

  const columns: Column<Beneficiary>[] = [
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
      {/* Header with Add Button */}
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

      {/* Data Table */}
      <div className="rounded-lg border border-border bg-card">
        <DataTable
          data={filteredBeneficiaries}
          columns={columns}
          keyExtractor={(ben) => ben.id}
          emptyMessage="No beneficiaries found"
        />
      </div>

      {/* Right Aside Panel */}
      <RightAside
        isOpen={isAsideOpen}
        onClose={() => setIsAsideOpen(false)}
        title={editingBeneficiary ? "Edit Beneficiary" : "Add New Beneficiary"}
        subtitle={editingBeneficiary ? `Editing ${editingBeneficiary.name}` : "Create a new beneficiary"}
      >
        <div className="space-y-4">
          {/* Name */}
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

          {/* Account Number */}
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

          {/* Description */}
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
              placeholder="Enter description"
              className="min-h-[80px] text-sm resize-none"
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
          </div>

          {/* Status */}
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

          {/* Save Button */}
          <div className="pt-4">
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {editingBeneficiary ? "Update Beneficiary" : "Save Beneficiary"}
            </Button>
          </div>
        </div>
      </RightAside>
    </div>
  );
}
