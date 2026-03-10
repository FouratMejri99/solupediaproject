import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { AnimatePresence, motion } from "framer-motion";
import {
  Edit2,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

interface Employee {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  department?: string;
  position?: string;
  isActive: boolean;
  createdAt?: string;
}

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    employeeId: "",
    department: "",
    position: "",
  });

  // tRPC queries and mutations
  const {
    data: employeesData,
    refetch: refetchEmployees,
    isLoading: isLoadingEmployees,
  } = trpc.admin.getAllEmployees.useQuery();
  const createEmployeeMutation = trpc.admin.createEmployee.useMutation();
  const updateEmployeeMutation = trpc.admin.updateEmployee.useMutation();
  const deleteEmployeeMutation = trpc.admin.deleteEmployee.useMutation();

  // Fetch employees on mount
  useEffect(() => {
    if (employeesData) {
      setEmployees(employeesData || []);
    }
  }, [employeesData]);

  useEffect(() => {
    setIsLoading(isLoadingEmployees);
  }, [isLoadingEmployees]);

  const fetchEmployees = async () => {
    await refetchEmployees();
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update existing employee
        const updates: any = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          employeeId: formData.employeeId,
          department: formData.department || undefined,
          position: formData.position || undefined,
        };

        // Only update password if provided
        if (formData.password) {
          updates.password = formData.password;
        }

        await updateEmployeeMutation.mutateAsync({
          id: editingId,
          updates,
        });
        toast.success("Employee updated successfully");
        setEditingId(null);
      } else {
        // Create new employee
        await createEmployeeMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          employeeId: formData.employeeId,
          department: formData.department || undefined,
          position: formData.position || undefined,
        });
        toast.success("Employee created successfully");
      }

      await fetchEmployees();
      setShowForm(false);
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        employeeId: "",
        department: "",
        position: "",
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to save employee");
    }
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      email: employee.email,
      password: "",
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeId: employee.employeeId,
      department: employee.department || "",
      position: employee.position || "",
    });
    setEditingId(employee.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployeeMutation.mutateAsync(id);
        toast.success("Employee deleted successfully");
        await fetchEmployees();
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete employee");
      }
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await updateEmployeeMutation.mutateAsync({
        id,
        updates: { isActive: !currentStatus },
      });
      toast.success(
        currentStatus ? "Employee deactivated" : "Employee activated"
      );
      await fetchEmployees();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    window.location.href = "/solupedia-admin";
  };

  const filteredEmployees = employees.filter(
    emp =>
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = employees.filter(emp => emp.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold">S</span>
              </motion.div>
              <div>
                <h1 className="font-bold text-gray-900">Employee Management</h1>
                <p className="text-xs text-gray-600">Admin Portal</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/change-password">
                <Button
                  variant="ghost"
                  className="rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                >
                  Change Password
                </Button>
              </Link>
              <Link href="/admin/subscribers">
                <Button
                  variant="ghost"
                  className="rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                >
                  Subscribers
                </Button>
              </Link>
              <Link href="/admin/reporting">
                <Button
                  variant="ghost"
                  className="rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                >
                  Reports
                </Button>
              </Link>
              <Link href="/admin/blog">
                <Button
                  variant="ghost"
                  className="rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                >
                  Blog
                </Button>
              </Link>
              <Link href="/admin/case-studies">
                <Button
                  variant="ghost"
                  className="rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                >
                  Case Studies
                </Button>
              </Link>
              <Link href="/admin/services">
                <Button
                  variant="ghost"
                  className="rounded-full hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                >
                  Services
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="rounded-full hover:bg-red-50 hover:text-red-600 border-gray-200"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg hover:shadow-xl transition-shadow rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {employees.length}
                </div>
                <p className="text-xs text-gray-500 mt-1">All employees</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg hover:shadow-xl transition-shadow rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {activeCount}
                </div>
                <p className="text-xs text-gray-500 mt-1">Currently active</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full bg-white/80 backdrop-blur-sm border-gray-200 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData({
                email: "",
                password: "",
                firstName: "",
                lastName: "",
                employeeId: "",
                department: "",
                position: "",
              });
              setShowForm(!showForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-600/20"
          >
            <Plus size={18} className="mr-2" />
            Add Employee
          </Button>
        </motion.div>

        {/* Add/Edit Employee Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <Card className="bg-white/90 backdrop-blur-md border-white/20 shadow-xl rounded-3xl">
                <CardHeader>
                  <CardTitle>
                    {editingId ? "Edit Employee" : "Add New Employee"}
                  </CardTitle>
                  <CardDescription>
                    {editingId
                      ? "Update employee information"
                      : "Create a new employee account for time tracking"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddEmployee} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="e.g., Ahmed"
                          value={formData.firstName}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          required
                          className="rounded-xl bg-white/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="e.g., Hassan"
                          value={formData.lastName}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          required
                          className="rounded-xl bg-white/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="e.g., ahmed@solupedia.com"
                          value={formData.email}
                          onChange={e =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                          className="rounded-xl bg-white/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input
                          id="employeeId"
                          placeholder="e.g., EMP-001"
                          value={formData.employeeId}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              employeeId: e.target.value,
                            })
                          }
                          required
                          className="rounded-xl bg-white/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          placeholder="e.g., Translation"
                          value={formData.department}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              department: e.target.value,
                            })
                          }
                          className="rounded-xl bg-white/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          placeholder="e.g., Senior Translator"
                          value={formData.position}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              position: e.target.value,
                            })
                          }
                          className="rounded-xl bg-white/50"
                        />
                      </div>

                      {!editingId && (
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter a secure password"
                              value={formData.password}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  password: e.target.value,
                                })
                              }
                              required={!editingId}
                              className="rounded-xl bg-white/50 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
                      >
                        {editingId ? "Update Employee" : "Create Employee"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowForm(false);
                          setEditingId(null);
                        }}
                        className="rounded-full px-6"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600">Loading employees...</p>
          </div>
        ) : (
          /* Employees Table */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg overflow-hidden rounded-3xl">
              <CardHeader className="bg-blue-50/50 border-b border-blue-100/50">
                <CardTitle>Employees</CardTitle>
                <CardDescription>
                  Manage employee accounts and access
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      {searchTerm
                        ? "No employees match your search."
                        : "No employees yet."}
                    </p>
                    {!searchTerm && (
                      <p className="text-sm text-gray-500 mt-1">
                        Add your first employee to get started.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/50">
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                            Name
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                            Email
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                            Employee ID
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                            Department
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                            Status
                          </th>
                          <th className="text-right py-4 px-6 font-semibold text-gray-900 text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map((emp, idx) => (
                          <motion.tr
                            key={emp.id}
                            className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                          >
                            <td className="py-4 px-6">
                              <div className="font-medium text-gray-900">
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div className="text-sm text-blue-600 font-medium">
                                {emp.position}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-gray-700">
                              {emp.email}
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                {emp.employeeId}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-700">
                              {emp.department || "-"}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                  emp.isActive
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-gray-100 text-gray-700 border border-gray-200"
                                }`}
                              >
                                {emp.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(emp)}
                                  className="h-8 w-8 p-0 rounded-full hover:bg-blue-100 text-blue-600"
                                >
                                  <Edit2 size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(emp.id)}
                                  className="h-8 w-8 p-0 rounded-full hover:bg-red-100 text-red-600"
                                >
                                  <Trash2 size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleToggleActive(
                                      emp.id,
                                      emp.isActive ?? false
                                    )
                                  }
                                  className={`h-8 w-8 p-0 rounded-full ${emp.isActive ? "hover:bg-orange-100 text-orange-600" : "hover:bg-green-100 text-green-600"}`}
                                  title={
                                    emp.isActive
                                      ? "Deactivate User"
                                      : "Activate User"
                                  }
                                >
                                  {emp.isActive ? (
                                    <UserX size={16} />
                                  ) : (
                                    <UserCheck size={16} />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 py-6 relative z-10">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2026 Solupedia LTD. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
