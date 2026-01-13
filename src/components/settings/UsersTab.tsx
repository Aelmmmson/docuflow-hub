/**
 * UsersTab Component
 * ==================
 * Settings tab for managing users with search, filters, and CRUD operations.
 */

import { useState } from "react";
import { Plus, Edit2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ActionMenu } from "@/components/shared/ActionMenu";
import { RightAside } from "@/components/shared/RightAside";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  role: "Admin" | "Manager" | "User" | "Viewer";
  status: "Active" | "Inactive";
}

// Mock data
const mockUsers: User[] = [
  { id: "USR001", username: "john.doe", email: "john.doe@company.com", role: "Admin", status: "Active" },
  { id: "USR002", username: "jane.smith", email: "jane.smith@company.com", role: "Manager", status: "Active" },
  { id: "USR003", username: "bob.wilson", email: "bob.wilson@company.com", role: "User", status: "Inactive" },
  { id: "USR004", username: "alice.brown", email: "alice.brown@company.com", role: "Viewer", status: "Active" },
  { id: "USR005", username: "charlie.davis", email: "charlie.davis@company.com", role: "User", status: "Active" },
];

const mockEmployees = [
  { id: "EMP001", name: "John Doe", email: "john.doe@company.com" },
  { id: "EMP002", name: "Jane Smith", email: "jane.smith@company.com" },
  { id: "EMP003", name: "Bob Wilson", email: "bob.wilson@company.com" },
  { id: "EMP004", name: "Alice Brown", email: "alice.brown@company.com" },
  { id: "EMP005", name: "Charlie Davis", email: "charlie.davis@company.com" },
];

export function UsersTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Aside state
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Active");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.id.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleAddNew = () => {
    setEditingUser(null);
    setSelectedEmployee("");
    setSelectedRole("");
    setSelectedStatus("Active");
    setIsAsideOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    const employee = mockEmployees.find((e) => e.email === user.email);
    setSelectedEmployee(employee?.id || "");
    setSelectedRole(user.role);
    setSelectedStatus(user.status);
    setIsAsideOpen(true);
  };

  const handleSave = () => {
    if (!selectedEmployee || !selectedRole) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const employee = mockEmployees.find((e) => e.id === selectedEmployee);
    if (!employee) return;

    if (editingUser) {
      // Update existing user
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                username: employee.name.toLowerCase().replace(" ", "."),
                email: employee.email,
                role: selectedRole as User["role"],
                status: selectedStatus as User["status"],
              }
            : u
        )
      );
      toast({
        title: "User Updated",
        description: `${employee.name} has been updated successfully.`,
      });
    } else {
      // Add new user
      const newUser: User = {
        id: `USR${String(users.length + 1).padStart(3, "0")}`,
        username: employee.name.toLowerCase().replace(" ", "."),
        email: employee.email,
        role: selectedRole as User["role"],
        status: selectedStatus as User["status"],
      };
      setUsers((prev) => [...prev, newUser]);
      toast({
        title: "User Added",
        description: `${employee.name} has been added successfully.`,
      });
    }

    setIsAsideOpen(false);
  };

  const columns: Column<User>[] = [
    { key: "id", header: "ID", className: "w-20" },
    { key: "username", header: "Username" },
    { key: "email", header: "Email", hideOnMobile: true },
    { key: "role", header: "Role" },
    {
      key: "status",
      header: "Status",
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (user) => (
        <ActionMenu
          actions={[
            {
              label: "Edit",
              icon: <Edit2 className="h-3 w-3" />,
              onClick: () => handleEdit(user),
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
                { value: "Admin", label: "Admin" },
                { value: "Manager", label: "Manager" },
                { value: "User", label: "User" },
                { value: "Viewer", label: "Viewer" },
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
          data={filteredUsers}
          columns={columns}
          keyExtractor={(user) => user.id}
          emptyMessage="No users found"
        />
      </div>

      {/* Right Aside Panel */}
      <RightAside
        isOpen={isAsideOpen}
        onClose={() => setIsAsideOpen(false)}
        title={editingUser ? "Edit User" : "Add New User"}
        subtitle={editingUser ? `Editing ${editingUser.username}` : "Create a new user account"}
      >
        <div className="space-y-4">
          {/* Select Employee */}
          <div className="space-y-2">
            <Label htmlFor="employee" className="text-xs font-medium">
              Select Employee <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger id="employee" className="h-9">
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
            <Label htmlFor="role" className="text-xs font-medium">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger id="role" className="h-9">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs font-medium">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
              <UserPlus className="h-4 w-4 mr-2" />
              {editingUser ? "Update User" : "Save User"}
            </Button>
          </div>
        </div>
      </RightAside>
    </div>
  );
}
