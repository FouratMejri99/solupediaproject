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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Link } from "wouter";

interface EmployeeReport {
  employeeId: number;
  employeeName: string;
  totalHours: number;
  businessDayHours: number;
  overtimeHours: number;
  projectCount: number;
  averageHoursPerDay: number;
  color: string;
}

interface DailyReport {
  date: string;
  totalHours: number;
  employeeCount: number;
  overtimeHours: number;
}

interface DailyEmployeeDetail {
  employeeId: number;
  employeeName: string;
  hours: number;
  overtimeHours: number;
  taskType: string;
  projectName: string;
}

interface DailyReportWithDetails extends DailyReport {
  employees: DailyEmployeeDetail[];
  avgHoursPerEmployee: number;
}

interface TaskTypeData {
  taskType: string;
  totalHours: number;
  color: string;
}

const TASK_COLORS: Record<string, string> = {
  Translation: "#3b82f6",
  Review: "#10b981",
  QA: "#f59e0b",
  "Desktop Publishing": "#8b5cf6",
  Other: "#ef4444",
};

// Color palette for clients/employees
const COLOR_PALETTE = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#eab308", // yellow
];

// Function to generate consistent color for a client/employee
const getClientColor = (clientName: string): string => {
  let hash = 0;
  for (let i = 0; i < clientName.length; i++) {
    hash = clientName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
};

export default function AdminReporting() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().split("T")[0].substring(0, 7)
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [employees, setEmployees] = useState<
    { id: number; firstName: string; lastName: string }[]
  >([]);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [showDailyDetails, setShowDailyDetails] = useState(true);

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { adminService } = await import("@/lib/supabase");
        const empList = await adminService.getAllEmployees();
        setEmployees(empList);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const toggleDayExpansion = (date: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const year = parseInt(selectedYear);
  const month = parseInt(selectedMonth.split("-")[1]);
  const day = selectedDay ? parseInt(selectedDay) : null;

  const startDate = new Date(
    parseInt(selectedMonth.split("-")[0]),
    parseInt(selectedMonth.split("-")[1]) - 1,
    day || 1
  );
  const endDate = new Date(
    parseInt(selectedMonth.split("-")[0]),
    parseInt(selectedMonth.split("-")[1]),
    day || 0
  );

  // Seed sample data mutation
  const seedMutation = trpc.admin.seedSampleReports.useMutation({
    onSuccess: data => {
      const created = data.filter((r: any) => r.status === "created").length;
      toast.success(
        `Successfully created ${created} sample reports for ${selectedYear}-${selectedMonth}`
      );
      // Refetch the data
      window.location.reload();
    },
    onError: error => {
      toast.error(error.message || "Failed to seed sample data");
    },
  });

  const handleSeedData = () => {
    seedMutation.mutate({ year, month });
  };

  // Fetch monthly report summary
  const { data: monthlySummary, isLoading: loadingSummary } =
    trpc.admin.getMonthlyReportSummary.useQuery(
      { year, month },
      {
        refetchOnWindowFocus: false,
        refetchInterval: 30000, // Auto-refresh every 30 seconds
      }
    );

  // Fetch daily report summary
  const { data: dailyReports, isLoading: loadingDaily } =
    trpc.admin.getDailyReportSummary.useQuery(
      { startDate, endDate },
      {
        refetchOnWindowFocus: false,
        refetchInterval: 30000, // Auto-refresh every 30 seconds
      }
    );

  // Fetch detailed daily report with employee breakdown
  const { data: detailedDailyReports, isLoading: loadingDetailedDaily } =
    trpc.admin.getDetailedDailyReport.useQuery(
      {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      {
        refetchOnWindowFocus: false,
        refetchInterval: 30000,
      }
    );

  // Fetch task type distribution
  const { data: taskDistribution, isLoading: loadingTask } =
    trpc.admin.getTaskTypeDistribution.useQuery(
      { startDate, endDate },
      {
        refetchOnWindowFocus: false,
        refetchInterval: 30000, // Auto-refresh every 30 seconds
      }
    );

  // Track last update time
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Update last updated time when data changes
  useEffect(() => {
    if (monthlySummary || dailyReports || taskDistribution) {
      setLastUpdated(new Date());
    }
  }, [monthlySummary, dailyReports, taskDistribution]);

  // Manual refresh function
  const handleRefresh = () => {
    window.location.reload();
  };

  // Transform monthly summary data
  const employeeReports: EmployeeReport[] =
    monthlySummary?.map((emp: any) => ({
      employeeId: emp.employeeId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      totalHours: parseFloat(emp.totalHours) || 0,
      businessDayHours: parseFloat(emp.businessDayHours) || 0,
      overtimeHours: parseFloat(emp.overtimeHours) || 0,
      projectCount: emp.projectCount || 0,
      averageHoursPerDay: emp.totalHours ? parseFloat(emp.totalHours) / 22 : 0,
      color: getClientColor(`${emp.firstName} ${emp.lastName}`),
    })) || [];

  // Transform daily reports for chart
  const dailyReportData: DailyReport[] =
    dailyReports?.map((day: any) => ({
      date: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      totalHours: parseFloat(day.totalHours) || 0,
      employeeCount: parseInt(day.employeeCount) || 0,
      overtimeHours: parseFloat(day.overtimeHours) || 0,
    })) || [];

  // Transform task distribution for pie chart
  const taskTypeDistribution: TaskTypeData[] =
    taskDistribution?.map((task: any) => ({
      taskType: task.taskType || "Other",
      totalHours: parseFloat(task.totalHours) || 0,
      color: TASK_COLORS[task.taskType] || TASK_COLORS["Other"],
    })) || [];

  // Filter data by selected employee
  const selectedEmployeeId = selectedEmployee
    ? parseInt(selectedEmployee)
    : null;

  // Filter monthly summary by employee
  const filteredEmployeeReports = selectedEmployeeId
    ? employeeReports.filter(emp => emp.employeeId === selectedEmployeeId)
    : employeeReports;

  // Calculate filtered stats
  const totalHours = filteredEmployeeReports.reduce(
    (sum, emp) => sum + emp.totalHours,
    0
  );
  const totalOvertime = filteredEmployeeReports.reduce(
    (sum, emp) => sum + emp.overtimeHours,
    0
  );
  const averageHours =
    filteredEmployeeReports.length > 0
      ? Math.round((totalHours / filteredEmployeeReports.length) * 100) / 100
      : 0;

  // Filter detailed daily reports by employee
  const filteredDetailedReports =
    detailedDailyReports?.map((day: any) => {
      if (!selectedEmployeeId) return day;
      return {
        ...day,
        employees: day.employees.filter(
          (emp: any) => emp.employeeId === selectedEmployeeId
        ),
        totalHours: day.employees
          .filter((emp: any) => emp.employeeId === selectedEmployeeId)
          .reduce((sum: number, emp: any) => sum + emp.hours, 0),
        employeeCount: day.employees.filter(
          (emp: any) => emp.employeeId === selectedEmployeeId
        ).length,
      };
    }) || [];

  const handleExportReport = () => {
    const doc = new jsPDF();
    const period = `${selectedYear}-${selectedMonth}`;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(30, 64, 175);
    doc.text("Solupedia - Monthly Time Tracking Report", 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Report Period: ${period}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 40);

    // Summary section
    doc.setFontSize(14);
    doc.setTextColor(30, 64, 175);
    doc.text("Summary", 14, 55);

    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(`Total Hours: ${totalHours.toFixed(2)}`, 14, 65);
    doc.text(`Total Overtime: ${totalOvertime.toFixed(2)} hours`, 14, 72);
    doc.text(`Active Employees: ${employeeReports.length}`, 14, 79);
    doc.text(`Average Hours/Employee: ${averageHours.toFixed(2)}`, 14, 86);

    // Employee table
    if (employeeReports.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text("Employee Hours", 14, 105);

      autoTable(doc, {
        startY: 110,
        head: [
          [
            "Employee",
            "Total Hours",
            "Business Hours",
            "Overtime",
            "Projects",
            "Avg/Day",
          ],
        ],
        body: employeeReports.map(emp => [
          emp.employeeName,
          `${emp.totalHours.toFixed(2)}h`,
          `${emp.businessDayHours.toFixed(2)}h`,
          `${emp.overtimeHours.toFixed(2)}h`,
          emp.projectCount.toString(),
          `${emp.averageHoursPerDay.toFixed(1)}h`,
        ]),
        theme: "striped",
        headStyles: { fillColor: [30, 64, 175] },
        styles: { fontSize: 9 },
      });
    }

    // Daily breakdown if available
    if (dailyReportData.length > 0) {
      const finalY = (doc as any).lastAutoTable?.finalY || 150;
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text("Daily Breakdown", 14, finalY + 15);

      autoTable(doc, {
        startY: finalY + 20,
        head: [["Date", "Total Hours", "Employees", "Overtime"]],
        body: dailyReportData.map(day => [
          day.date,
          `${day.totalHours.toFixed(2)}h`,
          day.employeeCount.toString(),
          `${day.overtimeHours.toFixed(2)}h`,
        ]),
        theme: "striped",
        headStyles: { fillColor: [30, 64, 175] },
        styles: { fontSize: 9 },
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Solupedia Reporting - Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    doc.save(`solupedia-report-${period}.pdf`);
    toast.success("Report exported successfully!");
  };

  // Show loading state
  const isLoading =
    loadingSummary || loadingDaily || loadingTask || loadingDetailedDaily;

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
              <Link href="/admin/dashboard">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-blue-50 text-blue-600"
                >
                  <ArrowLeft size={20} />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Reporting Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSeedData}
                disabled={seedMutation.isPending}
                variant="outline"
                className="rounded-full border-gray-300 hover:bg-gray-50"
              >
                {seedMutation.isPending ? "Seeding..." : "Seed Sample Data"}
              </Button>
              <Button
                onClick={handleExportReport}
                className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-600/20"
              >
                <Download size={18} className="mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-8 bg-white/80 backdrop-blur-md border-white/20 shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Filter size={18} className="text-blue-600" />
                  Report Filters
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {lastUpdated && (
                    <span>
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    className="h-8 w-8 p-0 rounded-full hover:bg-blue-100"
                    title="Refresh data"
                  >
                    <RefreshCw size={16} className="text-blue-600" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    min="2020"
                    max="2099"
                    className="rounded-xl bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={selectedMonth}
                    onChange={e => {
                      setSelectedMonth(e.target.value);
                      setSelectedDay(""); // Reset day when month changes
                    }}
                    className="rounded-xl bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="day">Specific Day (Optional)</Label>
                  <Input
                    id="day"
                    type="number"
                    placeholder="All days"
                    value={selectedDay}
                    onChange={e => setSelectedDay(e.target.value)}
                    min="1"
                    max="31"
                    className="rounded-xl bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee">Employee (Optional)</Label>
                  <select
                    id="employee"
                    value={selectedEmployee}
                    onChange={e => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 h-10"
                  >
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Filter Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-500 mr-2">
                  Quick filters:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDay("");
                    setSelectedMonth(
                      new Date().toISOString().split("T")[0].substring(0, 7)
                    );
                  }}
                  className="rounded-full text-xs"
                >
                  This Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const lastMonth = new Date();
                    lastMonth.setMonth(lastMonth.getMonth() - 1);
                    setSelectedMonth(
                      lastMonth.toISOString().split("T")[0].substring(0, 7)
                    );
                    setSelectedDay("");
                  }}
                  className="rounded-full text-xs"
                >
                  Last Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedMonth(
                      new Date().toISOString().split("T")[0].substring(0, 7)
                    );
                    setSelectedDay(
                      new Date().toISOString().split("T")[0].split("-")[2]
                    );
                  }}
                  className="rounded-full text-xs"
                >
                  Today
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading report data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                {
                  title: "Total Hours",
                  value: totalHours,
                  subtitle: "All employees",
                  color: "text-blue-600",
                },
                {
                  title: "Employees",
                  value: filteredEmployeeReports.length,
                  subtitle: selectedEmployee
                    ? "Selected employee"
                    : "Active employees",
                  color: "text-green-600",
                },
                {
                  title: "Overtime Hours",
                  value: totalOvertime,
                  subtitle: "Total overtime",
                  color: "text-orange-600",
                },
                {
                  title: "Avg Hours/Employee",
                  value: averageHours,
                  subtitle: "Monthly average",
                  color: "text-purple-600",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg hover:shadow-xl transition-shadow rounded-3xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-3xl font-bold ${item.color}`}>
                        {item.value}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.subtitle}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Daily Hours Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg rounded-3xl overflow-hidden h-full">
                  <CardHeader>
                    <CardTitle>Daily Hours Trend</CardTitle>
                    <CardDescription>
                      Total hours tracked per day
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dailyReportData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyReportData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                          />
                          <XAxis dataKey="date" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="totalHours"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="overtimeHours"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        No daily data available for this period
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Task Type Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg rounded-3xl overflow-hidden h-full">
                  <CardHeader>
                    <CardTitle>Task Type Distribution</CardTitle>
                    <CardDescription>
                      Percentage of hours by task type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {taskTypeDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={taskTypeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="totalHours"
                            nameKey="taskType"
                          >
                            {taskTypeDistribution.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="none"
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        No task data available for this period
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Employee Hours Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="mb-8 bg-white/80 backdrop-blur-md border-white/20 shadow-lg rounded-3xl overflow-hidden">
                <CardHeader>
                  <CardTitle>Employee Hours Comparison</CardTitle>
                  <CardDescription>
                    {selectedEmployee
                      ? "Selected employee hours"
                      : "Business hours vs overtime by employee"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredEmployeeReports.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={filteredEmployeeReports}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="employeeName"
                          angle={0}
                          textAnchor="middle"
                          height={30}
                          stroke="#6b7280"
                        />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="totalHours"
                          name="Total Hours"
                          radius={[4, 4, 0, 0]}
                        >
                          {employeeReports.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      No employee data available for this period
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Detailed Daily Breakdown Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg rounded-3xl overflow-hidden mb-8">
                <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-blue-100/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar size={20} className="text-blue-600" />
                        Daily Detailed Breakdown
                      </CardTitle>
                      <CardDescription>
                        Expand each day to see employee-level details
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {filteredDetailedReports?.length || 0} days with data
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredDetailedReports &&
                  filteredDetailedReports.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {filteredDetailedReports.map((day, idx) => {
                        const isExpanded = expandedDays.has(day.date);
                        const formattedDate = new Date(
                          day.date
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        });

                        return (
                          <motion.div
                            key={day.date}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.02 }}
                          >
                            {/* Day Header Row */}
                            <div
                              className="flex items-center justify-between p-4 hover:bg-blue-50/30 cursor-pointer transition-colors"
                              onClick={() => toggleDayExpansion(day.date)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  {isExpanded ? (
                                    <ChevronDown
                                      size={16}
                                      className="text-blue-600"
                                    />
                                  ) : (
                                    <ChevronRight
                                      size={16}
                                      className="text-blue-600"
                                    />
                                  )}
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-900">
                                    {formattedDate}
                                  </span>
                                  <span className="ml-2 text-sm text-gray-500">
                                    {new Date(day.date).toLocaleDateString(
                                      "en-US",
                                      { year: "numeric" }
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-8">
                                <div className="flex items-center gap-2">
                                  <Clock size={14} className="text-gray-400" />
                                  <span className="text-sm">
                                    <span className="font-medium text-gray-900">
                                      {day.totalHours.toFixed(1)}h
                                    </span>
                                    <span className="text-gray-500">
                                      {" "}
                                      total
                                    </span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Zap size={14} className="text-orange-400" />
                                  <span className="text-sm">
                                    <span className="font-medium text-orange-600">
                                      {day.overtimeHours.toFixed(1)}h
                                    </span>
                                    <span className="text-gray-500"> OT</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users size={14} className="text-gray-400" />
                                  <span className="text-sm">
                                    <span className="font-medium text-gray-900">
                                      {day.employeeCount}
                                    </span>
                                    <span className="text-gray-500">
                                      {" "}
                                      employees
                                    </span>
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  <span className="font-medium text-gray-700">
                                    {day.avgHoursPerEmployee.toFixed(1)}h
                                  </span>
                                  /emp
                                </div>
                              </div>
                            </div>

                            {/* Expanded Employee Details */}
                            <AnimatePresence>
                              {isExpanded &&
                                day.employees &&
                                day.employees.length > 0 && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="bg-gray-50/50 p-4 pl-16 pr-4">
                                      <table className="w-full">
                                        <thead>
                                          <tr className="text-xs text-gray-500 border-b border-gray-200">
                                            <th className="text-left py-2 font-medium">
                                              Employee
                                            </th>
                                            <th className="text-right py-2 font-medium">
                                              Hours
                                            </th>
                                            <th className="text-right py-2 font-medium">
                                              Overtime
                                            </th>
                                            <th className="text-left py-2 font-medium">
                                              Task Type
                                            </th>
                                            <th className="text-left py-2 font-medium">
                                              Project
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {day.employees.map((emp, empIdx) => (
                                            <tr
                                              key={empIdx}
                                              className="border-b border-gray-100 last:border-0"
                                            >
                                              <td className="py-2">
                                                <span className="font-medium text-gray-900">
                                                  {emp.employeeName}
                                                </span>
                                              </td>
                                              <td className="text-right py-2 text-gray-700">
                                                {emp.hours.toFixed(1)}h
                                              </td>
                                              <td className="text-right py-2 text-orange-600">
                                                {emp.overtimeHours.toFixed(1)}h
                                              </td>
                                              <td className="py-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                  {emp.taskType}
                                                </span>
                                              </td>
                                              <td className="py-2 text-gray-600">
                                                {emp.projectName}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12 text-gray-500">
                      No detailed daily data available for this period
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Employee Details Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg rounded-3xl overflow-hidden">
                <CardHeader className="bg-blue-50/50 border-b border-blue-100/50">
                  <CardTitle>
                    {selectedEmployee ? "Employee Details" : "Employee Details"}
                  </CardTitle>
                  <CardDescription>
                    {selectedEmployee
                      ? "Selected employee breakdown"
                      : "Detailed breakdown by employee"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredEmployeeReports.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50/50">
                            <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">
                              Employee
                            </th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-900 text-sm">
                              Total Hours
                            </th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-900 text-sm">
                              Business Hours
                            </th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-900 text-sm">
                              Overtime
                            </th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-900 text-sm">
                              Projects
                            </th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-900 text-sm">
                              Avg/Day
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEmployeeReports.map((emp, idx) => (
                            <motion.tr
                              key={emp.employeeId}
                              className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: 0.5 + idx * 0.05,
                              }}
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: emp.color }}
                                  />
                                  <span className="font-medium text-gray-900">
                                    {emp.employeeName}
                                  </span>
                                </div>
                              </td>
                              <td className="text-right py-4 px-6 text-gray-700">
                                {emp.totalHours}h
                              </td>
                              <td className="text-right py-4 px-6 text-green-600 font-medium">
                                {emp.businessDayHours}h
                              </td>
                              <td className="text-right py-4 px-6 text-orange-600 font-medium">
                                {emp.overtimeHours}h
                              </td>
                              <td className="text-right py-4 px-6 text-gray-700">
                                {emp.projectCount}
                              </td>
                              <td className="text-right py-4 px-6 text-gray-700">
                                {emp.averageHoursPerDay.toFixed(1)}h
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12 text-gray-500">
                      No employee data available for this period
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
