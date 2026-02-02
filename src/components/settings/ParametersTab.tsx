import { useState, useEffect } from "react";
import { Plus, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { RightAside } from "@/components/shared/RightAside";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────

interface DocumentType {
  id: number;
  code: string;
  description: string;
  trans_type: number; // 1 = transactional, 0 = non-transactional
  expense_code: string | null;
  account_number: string | null;
  account_desc: string | null;
  status: string; // "Active" | "Inactive" (after mapping)
}

interface ExpenseAccount {
  TACCT: string;
  ACCOUNT_DESCRP: string;
}

// Mock data (unchanged)
const mockExpenseAccounts: ExpenseAccount[] = [
  { TACCT: "610000000001", ACCOUNT_DESCRP: "Office Supplies Expense" },
  { TACCT: "610000000002", ACCOUNT_DESCRP: "Travel & Accommodation" },
  { TACCT: "610000000003", ACCOUNT_DESCRP: "Marketing & Advertising" },
  { TACCT: "620000000001", ACCOUNT_DESCRP: "Professional Services" },
  { TACCT: "620000000002", ACCOUNT_DESCRP: "Training & Development" },
];

export function ParametersTab() {
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<ExpenseAccount[]>(mockExpenseAccounts);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Aside / Form state
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [editingType, setEditingType] = useState<DocumentType | null>(null);

  // Form fields
  const [description, setDescription] = useState("");
  const [isTransactional, setIsTransactional] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountDesc, setAccountDesc] = useState("");
  const [status, setStatus] = useState<string>("Active");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // New state for searchable combobox
  const [openAccountCombobox, setOpenAccountCombobox] = useState(false);
  const [accountSearch, setAccountSearch] = useState("");

  // Filter accounts based on search
  const filteredAccounts = expenseAccounts.filter((acct) =>
    `${acct.TACCT} ${acct.ACCOUNT_DESCRP}`
      .toLowerCase()
      .includes(accountSearch.toLowerCase().trim())
  );

  const handleAccountSelect = (acct: ExpenseAccount) => {
    setAccountNumber(acct.TACCT);
    setAccountDesc(acct.ACCOUNT_DESCRP);
    setAccountSearch("");
    setOpenAccountCombobox(false);
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch document types
        const doctypesRes = await api.get<{ documents: DocumentType[] }>("/get-doc-types");
        if (doctypesRes.data.documents) {
          const mapped = doctypesRes.data.documents.map((dt) => ({
            ...dt,
            status: dt.status === "1" ? "Active" : "Inactive",
          }));
          setDocumentTypes(mapped);
        }

        setExpenseAccounts(mockExpenseAccounts);
      } catch (err: unknown) {
        console.error("Fetch failed:", err);
        toast({
          title: "Error",
          description: "Could not load parameters or accounts. Using mock data.",
          variant: "destructive",
        });
        setExpenseAccounts(mockExpenseAccounts);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredTypes = documentTypes.filter((type) => {
    const matchesSearch =
      type.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      type.code.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === "all" || type.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalItems = filteredTypes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedTypes = filteredTypes.slice(startIndex, endIndex);

  const handleAddNew = () => {
    setEditingType(null);
    setDescription("");
    setIsTransactional(false);
    setAccountNumber("");
    setAccountDesc("");
    setStatus("Active");
    setIsAsideOpen(true);
  };

  const handleEdit = (type: DocumentType) => {
    setEditingType(type);
    setDescription(type.description);
    setIsTransactional(type.trans_type === 1);
    setAccountNumber(type.account_number || "");
    setAccountDesc(type.account_desc || "");
    setStatus(type.status);
    setIsAsideOpen(true);
  };

  const handleSave = async () => {
    if (!description) {
      toast({
        title: "Validation Error",
        description: "Please fill in description.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      description,
      trans_type: isTransactional ? "1" : "0",
      expense_code: "",
      account_number: isTransactional ? accountNumber : null,
      account_desc: isTransactional ? accountDesc : null,
      status: status === "Active" ? "1" : "0",
      posted_by: currentUser?.user_id || 1,
      code_id: 2,
      id: editingType?.id || null,
    };

    try {
      if (editingType) {
        await api.put(`/update-doc-type`, payload);
        toast({ title: "Success", description: "Parameter updated." });
      } else {
        await api.post("/add-doc-type", payload);
        toast({ title: "Success", description: "Parameter added." });
      }

      // Refresh list
      const res = await api.get<{ documents: DocumentType[] }>("/get-doc-types");
      if (res.data.documents) {
        const mapped = res.data.documents.map((dt) => ({
          ...dt,
          status: dt.status === "1" ? "Active" : "Inactive",
        }));
        setDocumentTypes(mapped);
      }

      setIsAsideOpen(false);
    } catch (err: unknown) {
      console.error("Save failed:", err);
      toast({
        title: "Error",
        description: "Failed to save parameter.",
        variant: "destructive",
      });
    }
  };

  const columns: Column<DocumentType>[] = [
    { key: "code", header: "Code" },
    { key: "description", header: "Description" },
    {
      key: "trans_type",
      header: "Type",
      render: (type) => {
        const value = String(type.trans_type);
        const label =
          value === "1" ? "Transactional" :
          value === "0" ? "Non-Transactional" :
          "Unknown";
        return <span className="text-sm font-medium">{label}</span>;
      },
    },
    {
      key: "account_number",
      header: "Account Number",
      render: (type) => type.account_number || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (type) => <StatusBadge status={type.status} />,
    },
    {
      key: "actions",
      header: "Action",
      className: "w-16",
      render: (type) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleEdit(type)}
          title="Edit parameter"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SearchFilter
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search parameters..."
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
          data={paginatedTypes}
          columns={columns}
          keyExtractor={(type) => type.id.toString()}
          emptyMessage={loading ? "Loading parameters..." : "No parameters found"}
          isLoading={loading}
        />
        
        {/* Pagination Controls */}
        {filteredTypes.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>
                {startIndex + 1}-{endIndex} of {totalItems}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-1">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

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
            />
          </div>

          {/* Transactional Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="transactional" className="text-xs font-medium">
                Transactional type?
              </Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Enable for financial transactions
              </p>
            </div>
            <Switch
              id="transactional"
              checked={isTransactional}
              onCheckedChange={setIsTransactional}
            />
          </div>

          {/* Account field – now searchable combobox */}
          {isTransactional && (
            <div className="space-y-2">
              <Label htmlFor="account" className="text-xs font-medium">
                Select Account <span className="text-destructive">*</span>
              </Label>

              <Popover open={openAccountCombobox} onOpenChange={setOpenAccountCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openAccountCombobox}
                    className="w-full justify-between text-left font-normal"
                  >
                    {accountNumber && accountDesc
                      ? `${accountDesc} (${accountNumber})`
                      : "Search account number or description..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Type to search accounts..."
                      value={accountSearch}
                      onValueChange={setAccountSearch}
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No accounts found.</CommandEmpty>
                      <CommandGroup>
                        {filteredAccounts.map((acct) => (
                          <CommandItem
                            key={acct.TACCT}
                            value={acct.TACCT}
                            onSelect={() => handleAccountSelect(acct)}
                            className="text-sm"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                acct.TACCT === accountNumber ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <div className="flex flex-col">
                              <span>{acct.ACCOUNT_DESCRP}</span>
                              <span className="text-xs text-muted-foreground">{acct.TACCT}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {accountNumber && (
                <p className="text-xs text-muted-foreground">
                  Selected: {accountDesc} • {accountNumber}
                </p>
              )}
            </div>
          )}

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