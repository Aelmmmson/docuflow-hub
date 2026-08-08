/**
 * UsersTab Component
 * ==================
 * Settings tab for managing users with search, filters, and real backend CRUD.
 * Uses mock employees temporarily until external API is available.
 */

import { useState, useEffect } from "react";
import { Plus, Edit2, UserPlus, Check, ChevronsUpDown, FileSignature, Upload, Trash2, Eye, AlertTriangle, ShieldAlert, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RightAside } from "@/components/shared/RightAside";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { toTitleCase, getErrorMessage, cn } from "@/lib/utils";

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────

interface User {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: "Active" | "Inactive"; // ← exact values backend sends
  role: string;
  signature?: string | null;
}

interface Role {
  id: number;
  name: string;
}

interface ApiEmployee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  work_email: string;
  mobile_phone: string;
}

export function UsersTab() {
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form state
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Active");
  const [phone, setPhone] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [isEmployeePopoverOpen, setIsEmployeePopoverOpen] = useState(false);

  const { data: apiEmployees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await axios.get<ApiEmployee[]>("http://10.203.14.169/hr/api/employees_rest.php");
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // useEffect fetch block
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Roles
        const rolesRes = await api.get<{ results: Role[] }>("/get-users-roles");
        if (rolesRes.data.results) {
          setRoles(rolesRes.data.results);
        }

        // Users – no status remapping needed
        const usersRes = await api.get<{ results: User[] }>("/get-users");
        if (usersRes.data.results) {
          const sorted = [...usersRes.data.results].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
          setUsers(sorted);
        }
      } catch (err: unknown) {
        console.error("Fetch failed:", err);
        toast({
          title: "Error",
          description: `Could not load users or roles: ${getErrorMessage(err)}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredUsers = users.filter((user) => {
    const searchLower = searchValue.toLowerCase();
    const matchesSearch =
      user.employee_id?.toLowerCase().includes(searchLower) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const isApprover = selectedRole.toLowerCase() === "approver";

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file (PNG, JPG, SVG).",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSignature(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setSelectedEmployee("");
    setSelectedRole("");
    setSelectedStatus("Active");
    setPhone("");
    setSignature(null);
    setIsAsideOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const matched = apiEmployees.find((e) => e.work_email?.toLowerCase() === user.email?.toLowerCase());
    setSelectedEmployee(matched?.id || user.employee_id || "existing");
    const matchedRole = roles.find((r) => r.name.toLowerCase() === user.role?.toLowerCase());
    setSelectedRole(matchedRole ? matchedRole.name : user.role);
    setSelectedStatus(user.status);
    setPhone(user.phone || matched?.mobile_phone || "");
    setSignature(user.signature || null);
    setIsAsideOpen(true);
  };

  // Conflict & Confirmation Modal States
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [engagementData, setEngagementData] = useState<{
    hasEngagements: boolean;
    canRemoveSafely: boolean;
    engagements: any[];
    conflicts: any[];
  } | null>(null);

  const validateForm = (): boolean => {
    if (!editingUser && !selectedEmployee) {
      toast({
        title: "Validation Error",
        description: "Please select an employee.",
        variant: "destructive",
      });
      return false;
    }

    if (!selectedRole) {
      toast({
        title: "Validation Error",
        description: "Please select a role.",
        variant: "destructive",
      });
      return false;
    }

    const currentRoleIsApprover = selectedRole.toLowerCase() === "approver" || selectedRole.toLowerCase() === "admin";
    if (currentRoleIsApprover && !signature) {
      toast({
        title: "Signature Required",
        description: "Please upload an approver signature image before saving an Approver user.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const executeSave = async (autoRemoveApprovals = false) => {
    if (!validateForm()) return;

    const emp = apiEmployees.find((e) => e.id === selectedEmployee);
    if (!emp && !editingUser) return;

    if (editingUser && autoRemoveApprovals) {
      try {
        await api.delete(`/remove-user-from-approvals/${editingUser.id}`);
      } catch (remErr) {
        console.warn("Could not auto-remove user from approvals:", remErr);
      }
    }

    const payload = {
      first_name: emp?.first_name || editingUser?.first_name || "",
      last_name: emp?.last_name || editingUser?.last_name || "Unknown",
      email: emp?.work_email || editingUser?.email || "",
      employee_id: emp?.employee_id || editingUser?.employee_id || "",
      phone: phone || emp?.mobile_phone || editingUser?.phone || "0240000000",
      role: selectedRole,
      status: selectedStatus === "Active" ? "1" : "0",
      posted_by: currentUser?.user_id || 1,
      ...(isApprover && signature ? { signature } : {}),
    };

    try {
      if (editingUser) {
        await api.put(`/update-user/${editingUser.id}`, {
          employee_id: editingUser.employee_id,
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          posted_by: currentUser?.user_id || 1,
          role: selectedRole,
          status: payload.status,
          phone: payload.phone,
          ...(isApprover && signature ? { signature } : {}),
        });
        toast({ title: "Success", description: "User updated successfully." });
      } else {
        await api.post("/user/register", payload);
        toast({ title: "Success", description: "User registered successfully." });
      }

      const res = await api.get<{ results: User[] }>("/get-users");
      if (res.data.results) {
        setUsers(res.data.results);
      }

      setIsAsideOpen(false);
      setIsConfirmModalOpen(false);
      setIsConflictModalOpen(false);
    } catch (err: unknown) {
      console.error("Save failed:", err);
      toast({
        title: "Error",
        description: getErrorMessage(err, "Failed to save user."),
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (editingUser) {
      const isRoleChanged = editingUser.role.toLowerCase() !== selectedRole.toLowerCase();
      const isStatusInactive = selectedStatus === "Inactive" && editingUser.status === "Active";

      if (isRoleChanged || isStatusInactive) {
        try {
          const checkRes = await api.get(`/check-user-engagement/${editingUser.id}`);
          const data = checkRes.data;

          if (data.hasEngagements) {
            setEngagementData(data);
            if (!data.canRemoveSafely) {
              setIsConflictModalOpen(true);
              return;
            } else {
              setIsConfirmModalOpen(true);
              return;
            }
          }
        } catch (chkErr) {
          console.error("Could not check user engagement:", chkErr);
        }
      }
    }

    await executeSave(false);
  };

  // View state
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleView = (user: User) => {
    setViewingUser(user);
    setIsViewOpen(true);
  };

  const columns: Column<User>[] = [
    { key: "employee_id", header: "Employee ID", className: "w-28" },
    {
      key: "name",
      header: "Name",
      render: (u) => <span>{toTitleCase(`${u.first_name} ${u.last_name}`)}</span>,
    },
    { key: "email", header: "Email", hideOnMobile: true },
    {
      key: "role",
      header: "Role",
      render: (u) => <span className="capitalize">{u.role}</span>
    },
    {
      key: "status",
      header: "Status",
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24 text-right",
      render: (user) => (
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                  onClick={() => handleView(user)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:bg-primary hover:text-white transition-colors"
                  onClick={() => handleEdit(user)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit User</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
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
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchFilter
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search users..."
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
            {
              key: "role",
              label: "Role",
              value: roleFilter,
              onChange: setRoleFilter,
              options: [
                { value: "all", label: "All Roles" },
                ...roles.map((r) => ({ value: r.name, label: toTitleCase(r.name) })),
              ],
            },
          ]}
        />
        <Button onClick={handleAddNew} size="sm" className="ml-3 shrink-0">
          <Plus className="h-4 w-4 mr-1" />
          Add New
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <DataTable
          data={paginatedUsers}
          columns={columns}
          keyExtractor={(user) => user.id.toString()}
          emptyMessage={loading ? "Loading users..." : "No users found"}
          isLoading={loading}
        />

        {/* Pagination Controls */}
        {filteredUsers.length > 0 && (
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
                  // Show current page and nearby pages
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
        title={editingUser ? "Edit User" : "Add New User"}
        subtitle={
          editingUser
            ? `Editing ${toTitleCase(editingUser.first_name)} ${toTitleCase(editingUser.last_name)}`
            : "Create a new user account"
        }
      >
        <div className="space-y-6">
          {/* Employee Select (For New User) vs Read-Only Employee Card (For Edit User) */}
          {editingUser ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Employee Account</Label>
              <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {toTitleCase(editingUser.first_name)} {toTitleCase(editingUser.last_name)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{editingUser.email}</p>
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold bg-muted text-muted-foreground border-border">
                  Emp ID: {editingUser.employee_id}
                </Badge>
              </div>
            </div>
          ) : (
            (() => {
              const registeredEmpIds = new Set(users.map((u) => String(u.employee_id)));
              const registeredEmails = new Set(users.map((u) => u.email?.toLowerCase()));
              const availableApiEmployees = apiEmployees.filter((emp) => {
                return !registeredEmpIds.has(String(emp.id)) && !registeredEmails.has(emp.work_email?.toLowerCase());
              });

              return (
                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="employee">Select Employee *</Label>
                  <Popover open={isEmployeePopoverOpen} onOpenChange={setIsEmployeePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="employee"
                        variant="outline"
                        role="combobox"
                        aria-expanded={isEmployeePopoverOpen}
                        className="w-full justify-between font-normal"
                      >
                        {selectedEmployee
                          ? (() => {
                            const e = apiEmployees.find((emp) => emp.id === selectedEmployee);
                            return e ? `${e.first_name} ${e.last_name} (${e.work_email})` : "Select an employee";
                          })()
                          : "Select an employee"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search employee..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>{isLoadingEmployees ? "Loading employees..." : "No employee found."}</CommandEmpty>
                          <CommandGroup>
                            {availableApiEmployees.map((emp) => (
                              <CommandItem
                                key={emp.id}
                                value={`${emp.first_name} ${emp.last_name} ${emp.work_email}`}
                                onSelect={() => {
                                  setSelectedEmployee(emp.id);
                                  setIsEmployeePopoverOpen(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span>{`${emp.first_name} ${emp.last_name}`}</span>
                                  <span className="text-xs text-muted-foreground group-data-[selected='true']:text-primary-foreground/80">{emp.work_email}</span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    selectedEmployee === emp.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              );
            })()
          )}

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Approver Signature Upload (Approver Role Only) */}
          {isApprover && (
            <div className="space-y-3 p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5">
              <div className="flex items-center justify-between">
                <Label htmlFor="signature-file" className="font-semibold text-sm flex items-center gap-1.5 cursor-pointer">
                  <FileSignature className="w-4 h-4 text-primary" />
                  <span>Approver Signature *</span>
                </Label>
                {signature && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setSignature(null)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                )}
              </div>

              {signature ? (
                <div className="relative group rounded-lg border border-border bg-white dark:bg-card p-3 flex flex-col items-center justify-center">
                  <img
                    src={signature}
                    alt="Approver Signature Preview"
                    className="max-h-24 max-w-full object-contain rounded"
                  />
                  <span className="text-[11px] text-muted-foreground mt-2 font-medium">
                    Signature Image Loaded (Base64)
                  </span>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="signature-file"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 rounded-xl p-4 cursor-pointer transition-colors bg-card/60 hover:bg-card text-center"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground mb-1.5" />
                    <span className="text-xs font-semibold text-foreground">
                      Click to upload signature image
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      PNG, JPG, or SVG format
                    </span>
                    <input
                      id="signature-file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSignatureUpload}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} className="w-full" disabled={loading}>
              <UserPlus className="h-4 w-4 mr-2" />
              {editingUser ? "Update User" : "Save User"}
            </Button>
          </div>
        </div>
      </RightAside>

      {/* View User Details Aside Drawer */}
      <RightAside
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="User Details"
        subtitle={
          viewingUser
            ? `${toTitleCase(viewingUser.first_name)} ${toTitleCase(viewingUser.last_name)}`
            : "User account overview"
        }
      >
        {viewingUser && (
          <div className="space-y-6 text-sm">
            {/* User Profile Overview Header */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {toTitleCase(`${viewingUser.first_name} ${viewingUser.last_name}`)}
                  </h3>
                  <p className="text-xs text-muted-foreground">{viewingUser.email}</p>
                </div>
                <StatusBadge status={viewingUser.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-muted-foreground font-medium">Employee ID</span>
                  <span className="font-semibold text-foreground">{viewingUser.employee_id || "N/A"}</span>
                </div>

                <div>
                  <span className="block text-muted-foreground font-medium">Role</span>
                  <span className="font-semibold text-foreground capitalize">{viewingUser.role}</span>
                </div>

                <div>
                  <span className="block text-muted-foreground font-medium">Phone</span>
                  <span className="font-semibold text-foreground">{viewingUser.phone || "N/A"}</span>
                </div>

                <div>
                  <span className="block text-muted-foreground font-medium">User ID</span>
                  <span className="font-semibold text-foreground">#{viewingUser.id}</span>
                </div>
              </div>
            </div>

            {/* Approver Signature Section (No sensitive data / passwords shown) */}
            {viewingUser.signature ? (
              <div className="space-y-2 p-4 rounded-xl border border-border bg-card">
                <Label className="font-semibold text-xs flex items-center gap-1.5 text-muted-foreground">
                  <FileSignature className="w-4 h-4 text-primary" />
                  <span>Approver Signature</span>
                </Label>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[120px]">
                  <img
                    src={viewingUser.signature}
                    alt="Approver Signature"
                    className="max-h-28 max-w-full object-contain rounded"
                  />
                </div>
              </div>
            ) : viewingUser.role.toLowerCase() === "approver" ? (
              <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 text-center">
                <p className="text-xs text-muted-foreground italic">No signature image uploaded for this approver yet.</p>
              </div>
            ) : null}
          </div>
        )}
      </RightAside>

      {/* ─────────────────────────────────────────────────────────────
          1. BLOCKED CONFLICT MODAL (Cannot remove due to deadlock)
         ───────────────────────────────────────────────────────────── */}
      <Dialog open={isConflictModalOpen} onOpenChange={setIsConflictModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-rose-200 dark:border-rose-900 bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Role / Status Update Blocked
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Updating <strong>{editingUser ? `${editingUser.first_name} ${editingUser.last_name}` : "this user"}</strong> cannot proceed because removing them as an active approver creates a workflow deadlock in the following setup stages.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs space-y-2">
              <p className="font-semibold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                Active Workflow Conflicts Detected:
              </p>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {engagementData?.conflicts?.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white dark:bg-card border border-rose-200/60 dark:border-rose-900/60 text-xs">
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span>{c.doctypeName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                        Stage {c.stageNum} ({c.isMandatory ? "Mandatory" : "Optional"})
                      </span>
                    </div>
                    <p className="text-rose-600 dark:text-rose-400 text-[11px] mt-1 font-medium">{c.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground italic">
              * Please reassign or update the stage approvers in <strong>Settings &gt; Approval Setup</strong> before attempting to change this user's role or status.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" className="w-full text-xs font-semibold" onClick={() => setIsConflictModalOpen(false)}>
              Understood (Cancel Role Update)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
          2. SAFE REMOVAL CONFIRMATION MODAL (Admin can confirm removal)
         ───────────────────────────────────────────────────────────── */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-amber-200 dark:border-amber-900 bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Confirm Approver Setup Removal
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              <strong>{editingUser ? `${editingUser.first_name} ${editingUser.last_name}` : "This user"}</strong> is currently assigned as an active approver in <strong>{engagementData?.engagements?.length || 0}</strong> approval setup stages.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs space-y-2">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                The user will be automatically removed from the following setups (stage quorum will remain satisfied):
              </p>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {engagementData?.engagements?.map((e, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white dark:bg-card border border-amber-200/60 dark:border-amber-900/60 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground block">{e.doctypeName}</span>
                      <span className="text-[11px] text-muted-foreground">
                        Stage {e.stageNum} • {e.isMandatory ? "Mandatory" : "Optional"}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                      Quorum Safe
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Do you want to remove this user from these active approval setups and apply the role/status update?
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold" onClick={() => executeSave(true)}>
              Proceed & Remove from Setups
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}