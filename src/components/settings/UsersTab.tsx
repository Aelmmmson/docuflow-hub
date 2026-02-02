/**
 * UsersTab Component
 * ==================
 * Settings tab for managing users with search, filters, and real backend CRUD.
 * Uses mock employees temporarily until external API is available.
 */

import { useState, useEffect } from "react";
import { Plus, Edit2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

// Temporary mock employees (replace with real API later)
const mockEmployees = [
  { id: "EMP001", name: "John Doe", email: "john.doe@company.com" },
  { id: "EMP002", name: "Jane Smith", email: "jane.smith@company.com" },
  { id: "EMP003", name: "Bob Wilson", email: "bob.wilson@company.com" },
  { id: "EMP004", name: "Alice Brown", email: "alice.brown@company.com" },
  { id: "EMP005", name: "Charlie Davis", email: "charlie.davis@company.com" },
  { id: "EMP006", name: "Henry Amoh", email: "hnramoh3@gmail.com" },
];

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
        const message = err instanceof Error ? err.message : "Unknown error";
        toast({
          title: "Error",
          description: `Could not load users or roles: ${message}`,
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
    setIsAsideOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const matched = mockEmployees.find((e) => e.email === user.email);
    setSelectedEmployee(matched?.id || "");
    setSelectedRole(user.role);
    setSelectedStatus(user.status);
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

    const emp = mockEmployees.find((e) => e.id === selectedEmployee);
    if (!emp) return;

    const nameParts = emp.name.trim().split(/\s+/);
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "Unknown";

    const payload = {
      first_name,
      last_name,
      email: emp.email,
      employee_id: selectedEmployee,
      phone: "", // empty string to satisfy NOT NULL constraint
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
          // phone: editingUser.phone || "", // if needed
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
      const message = err instanceof Error ? err.message : "Failed to save user.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const columns: Column<User>[] = [
    { key: "employee_id", header: "Employee ID", className: "w-28" },
    {
      key: "name",
      header: "Name",
      render: (u) => `${u.first_name} ${u.last_name}`,
    },
    { key: "email", header: "Email", hideOnMobile: true },
    { key: "role", header: "Role" },
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
                ...roles.map((r) => ({ value: r.name, label: r.name })),
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
            ? `Editing ${editingUser.first_name} ${editingUser.last_name}`
            : "Create a new user account"
        }
      >
        <div className="space-y-6">
          {/* Employee Select */}
          <div className="space-y-2">
            <Label htmlFor="employee">Select Employee *</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {mockEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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