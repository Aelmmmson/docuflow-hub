/**
 * UsersTab Component
 * ==================
 * Settings tab for managing users with search, filters, and real backend CRUD.
 * Uses mock employees temporarily until external API is available.
 */

import { useState, useEffect } from "react";
import { Plus, Edit2, UserPlus, Check, ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  // ... other fields if needed
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
          setUsers(usersRes.data.results); // ← direct use
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

  const handleAddNew = () => {
    setEditingUser(null);
    setSelectedEmployee("");
    setSelectedRole("");
    setSelectedStatus("Active");
    setPhone("");
    setIsAsideOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const matched = apiEmployees.find((e) => e.work_email === user.email);
    setSelectedEmployee(matched?.id || "");
    setSelectedRole(user.role);
    setSelectedStatus(user.status);
    setPhone(user.phone || matched?.mobile_phone || "");
    setIsAsideOpen(true);
  };

  const handleSave = async () => {
    if (!selectedEmployee || !selectedRole) {
      toast({
        title: "Validation Error",
        description: "Please select an employee and role.",
        variant: "destructive",
      });
      return;
    }

    const emp = apiEmployees.find((e) => e.id === selectedEmployee);
    if (!emp) return;

    const payload = {
      first_name: emp.first_name || "",
      last_name: emp.last_name || "Unknown",
      email: emp.work_email,
      employee_id: emp.employee_id,
      phone: phone || emp.mobile_phone || `024${Math.floor(1000000 + Math.random() * 9000000)}`, // Unique fallback
      role: selectedRole,
      status: selectedStatus === "Active" ? "1" : "0",
      posted_by: currentUser?.user_id || 1,
    };

    try {
      if (editingUser) {
        // Send ALL required fields to satisfy backend validation
        await api.put(`/update-user/${editingUser.id}`, {
          employee_id: editingUser.employee_id, // keep existing
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          posted_by: currentUser?.user_id || 1,
          role: selectedRole,
          status: payload.status,
          phone: payload.phone,
        });
        toast({ title: "Success", description: "User updated." });
      } else {
        await api.post("/user/register", payload);
        toast({ title: "Success", description: "User registered." });
      }

      // In handleSave – refresh block
      // Refresh list
      const res = await api.get<{ results: User[] }>("/get-users");
      if (res.data.results) {
        setUsers(res.data.results); // ← direct use, no ternary
      }

      setIsAsideOpen(false);
    } catch (err: unknown) {
      console.error("Save failed:", err);
      toast({
        title: "Error",
        description: getErrorMessage(err, "Failed to save user."),
        variant: "destructive",
      });
    }
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
      header: "Action", // Added header name
      className: "w-16",
      render: (user) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleEdit(user)}
          title="Edit user"
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
          {/* Employee Select */}
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
                      {apiEmployees.map((emp) => (
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
    </div>
  );
}