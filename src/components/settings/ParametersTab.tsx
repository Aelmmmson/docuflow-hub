/**
 * ParametersTab Component
 * =======================
 * Settings tab for managing document types/parameters.
 */

import { useState } from "react";
import { Plus, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

interface DocumentType {
  id: string;
  code: string;
  description: string;
  isTransactional: boolean;
  status: "Active" | "Inactive";
}

// Mock data
const mockDocumentTypes: DocumentType[] = [
  { id: "DOC001", code: "DOCS", description: "Electric Expenses", isTransactional: true, status: "Active" },
  { id: "DOC002", code: "DOCS", description: "Newspaper Expense", isTransactional: false, status: "Active" },
  { id: "DOC003", code: "DOCS", description: "Travel Reimbursement", isTransactional: true, status: "Active" },
  { id: "DOC004", code: "DOCS", description: "Office Supplies", isTransactional: false, status: "Inactive" },
  { id: "DOC005", code: "DOCS", description: "Invoice Payment", isTransactional: true, status: "Active" },
];

export function ParametersTab() {
  const { toast } = useToast();
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(mockDocumentTypes);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Aside state
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [editingType, setEditingType] = useState<DocumentType | null>(null);

  // Form state
  const [description, setDescription] = useState("");
  const [isTransactional, setIsTransactional] = useState(false);
  const [status, setStatus] = useState<string>("Active");

  const filteredTypes = documentTypes.filter((type) => {
    const matchesSearch =
      type.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      type.code.toLowerCase().includes(searchValue.toLowerCase()) ||
      type.id.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === "all" || type.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddNew = () => {
    setEditingType(null);
    setDescription("");
    setIsTransactional(false);
    setStatus("Active");
    setIsAsideOpen(true);
  };

  const handleEdit = (type: DocumentType) => {
    setEditingType(type);
    setDescription(type.description);
    setIsTransactional(type.isTransactional);
    setStatus(type.status);
    setIsAsideOpen(true);
  };

  const handleSave = () => {
    if (!description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a description.",
        variant: "destructive",
      });
      return;
    }

    if (editingType) {
      // Update existing
      setDocumentTypes((prev) =>
        prev.map((t) =>
          t.id === editingType.id
            ? {
                ...t,
                description,
                isTransactional,
                status: status as DocumentType["status"],
              }
            : t
        )
      );
      toast({
        title: "Parameter Updated",
        description: `${description} has been updated successfully.`,
      });
    } else {
      // Add new
      const newType: DocumentType = {
        id: `DOC${String(documentTypes.length + 1).padStart(3, "0")}`,
        code: "DOCS",
        description,
        isTransactional,
        status: status as DocumentType["status"],
      };
      setDocumentTypes((prev) => [...prev, newType]);
      toast({
        title: "Parameter Added",
        description: `${description} has been added successfully.`,
      });
    }

    setIsAsideOpen(false);
  };

  const columns: Column<DocumentType>[] = [
    { key: "id", header: "ID", className: "w-20" },
    { key: "code", header: "Code", className: "w-20" },
    { key: "description", header: "Description" },
    {
      key: "isTransactional",
      header: "Transactional?",
      render: (type) => <StatusBadge status={type.isTransactional ? "Yes" : "No"} />,
    },
    {
      key: "status",
      header: "Status",
      render: (type) => <StatusBadge status={type.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (type) => (
        <ActionMenu
          actions={[
            {
              label: "Edit",
              icon: <Edit2 className="h-3 w-3" />,
              onClick: () => handleEdit(type),
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
          searchPlaceholder="Search document types..."
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
          data={filteredTypes}
          columns={columns}
          keyExtractor={(type) => type.id}
          emptyMessage="No document types found"
        />
      </div>

      {/* Right Aside Panel */}
      <RightAside
        isOpen={isAsideOpen}
        onClose={() => setIsAsideOpen(false)}
        title={editingType ? "Edit Parameter" : "Add New Parameter"}
        subtitle={editingType ? `Editing ${editingType.description}` : "Create a new document type"}
      >
        <div className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-medium">
              Description <span className="text-destructive">*</span>
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="h-9"
            />
          </div>

          {/* Is Transactional Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="transactional" className="text-xs font-medium">
                Is this a transactional type of document?
              </Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Enable if this document type involves financial transactions
              </p>
            </div>
            <Switch
              id="transactional"
              checked={isTransactional}
              onCheckedChange={setIsTransactional}
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
              {editingType ? "Update Parameter" : "Save Parameter"}
            </Button>
          </div>
        </div>
      </RightAside>
    </div>
  );
}
