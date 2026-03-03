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
  Briefcase,
  Calendar,
  Clock,
  LogOut,
  Play,
  Plus,
  Save,
  StopCircle,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

// List of common languages for selection
const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Turkish",
  "Polish",
  "Swedish",
  "Danish",
  "Norwegian",
  "Finnish",
  "Czech",
  "Romanian",
  "Hungarian",
  "Greek",
  "Hebrew",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Malay",
];

interface TimeRecord {
  id: number;
  workDate: string;
  projectNumber?: string;
  projectName?: string;
  taskType: string;
  client?: string;
  languages: string;
  startTime: string;
  endTime: string;
  duration: number;
  businessDayTime: number;
  overtime: number;
}

export default function EmployeeDashboard() {
  const [, setLocation] = useLocation();
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    projectNumber: "",
    projectName: "",
    taskType: "translation",
    client: "",
    languages: "",
    startTime: "10:00",
    endTime: "18:00",
    notes: "",
  });

  // tRPC mutations
  const utils = trpc.useUtils();
  const createRecordMutation = trpc.employee.createTimeRecord.useMutation();
  const deleteRecordMutation = trpc.employee.deleteRecord.useMutation();

  // tRPC query for fetching records
  const { data: dbRecords, refetch: refetchRecords } =
    trpc.employee.getRecords.useQuery(employeeId || 0);

  // Refetch data when employeeId changes (e.g., after login)
  useEffect(() => {
    if (employeeId) {
      refetchRecords();
    }
  }, [employeeId, refetchRecords]);

  // Fetch records from database on mount
  useEffect(() => {
    const employeeSession = localStorage.getItem("employeeSession");
    if (!employeeSession) {
      setLocation("/employee/login");
      return;
    }

    try {
      const session = JSON.parse(employeeSession);
      setEmployeeId(session.id);

      // Session expires after 24 hours
      const loginTime = new Date(session.loginTime);
      const now = new Date();
      const hoursSinceLogin =
        (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLogin > 24) {
        localStorage.removeItem("employeeSession");
        setLocation("/employee/login");
      }
    } catch (error) {
      localStorage.removeItem("employeeSession");
      setLocation("/employee/login");
    }
  }, [setLocation]);

  // Update records when dbRecords changes
  useEffect(() => {
    if (dbRecords) {
      const transformedRecords: TimeRecord[] = dbRecords.map((record: any) => {
        const workDate = record.date
          ? new Date(record.date).toISOString().split("T")[0]
          : "";
        const projectNumber = record.projectnumber || "";
        const projectName = record.projectname || "";
        const taskType = record.tasktype || "";
        const client = record.client || "";
        const languages = (record.languages || "") as string;
        const startTime = record.starttime || "";
        const endTime = record.endtime || "";
        const duration = parseFloat(record.duration) || 0;

        // Recompute business hours and overtime on the fly from start/end
        let businessDayTime = 0;
        let overtime = 0;
        if (startTime && endTime) {
          const [startHour, startMin] = startTime.split(":").map(Number);
          const [endHour, endMin] = endTime.split(":").map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;

          const businessStartMinutes = 10 * 60; // 10:00 AM
          const businessEndMinutes = 18 * 60; // 6:00 PM

          if (
            startMinutes >= businessEndMinutes ||
            endMinutes <= businessStartMinutes
          ) {
            overtime = duration;
          } else if (
            startMinutes >= businessStartMinutes &&
            endMinutes <= businessEndMinutes
          ) {
            businessDayTime = duration;
          } else {
            const overlapStart = Math.max(startMinutes, businessStartMinutes);
            const overlapEnd = Math.min(endMinutes, businessEndMinutes);
            businessDayTime =
              Math.round(((overlapEnd - overlapStart) / 60) * 100) / 100;
            overtime = Math.round((duration - businessDayTime) * 100) / 100;
          }
        }

        return {
          id: record.id,
          workDate,
          projectNumber,
          projectName,
          taskType,
          client,
          languages,
          startTime,
          endTime,
          duration,
          businessDayTime,
          overtime,
        };
      });
      setRecords(transformedRecords);
    }
  }, [dbRecords]);

  useEffect(() => {
    const saved = localStorage.getItem("employeeLiveTimer");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.start) {
          setTimerStart(parsed.start);
        }
        if (parsed.running) {
          setTimerRunning(true);
        }
        if (parsed.elapsedSeconds) {
          setElapsedSeconds(parsed.elapsedSeconds);
        } else if (parsed.running && parsed.start) {
          setElapsedSeconds(Math.floor((Date.now() - parsed.start) / 1000));
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (timerRunning && timerStart) {
      interval = window.setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - timerStart) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerRunning, timerStart]);

  useEffect(() => {
    localStorage.setItem(
      "employeeLiveTimer",
      JSON.stringify({
        running: timerRunning,
        start: timerStart,
        elapsedSeconds,
      })
    );
  }, [timerRunning, timerStart, elapsedSeconds]);

  const formatElapsed = (s: number) => {
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  const startLiveTimer = () => {
    const now = Date.now();
    setTimerStart(now);
    setElapsedSeconds(0);
    setTimerRunning(true);
  };

  const stopLiveTimer = async () => {
    if (!timerStart) return;
    const endMs = Date.now();
    const startDate = new Date(timerStart);
    const endDate = new Date(endMs);
    const workDate = new Date().toISOString().split("T")[0];
    const startStr = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`;
    const endStr = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;

    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
    let durationMinutes = endMinutes - startMinutes;
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60;
    }
    const duration = Math.round((durationMinutes / 60) * 100) / 100;

    const businessStartMinutes = 9 * 60;
    const businessEndMinutes = 17 * 60;
    let businessDayTime = 0;
    let overtime = 0;
    if (
      startMinutes >= businessEndMinutes ||
      endMinutes <= businessStartMinutes
    ) {
      overtime = duration;
    } else if (
      startMinutes >= businessStartMinutes &&
      endMinutes <= businessEndMinutes
    ) {
      businessDayTime = duration;
    } else {
      const overlapStart = Math.max(startMinutes, businessStartMinutes);
      const overlapEnd = Math.min(endMinutes, businessEndMinutes);
      businessDayTime =
        Math.round(((overlapEnd - overlapStart) / 60) * 100) / 100;
      overtime = Math.round((duration - businessDayTime) * 100) / 100;
    }

    const newRecord: TimeRecord = {
      id: Date.now(),
      workDate,
      projectNumber: formData.projectNumber,
      projectName: formData.projectName,
      taskType: formData.taskType,
      client: formData.client,
      languages: formData.languages, // store as string
      startTime: startStr,
      endTime: endStr,
      duration,
      businessDayTime,
      overtime,
    };

    // Save to database
    if (employeeId) {
      try {
        await createRecordMutation.mutateAsync({
          employeeId,
          workDate: new Date(workDate),
          projectNumber: formData.projectNumber,
          projectName: formData.projectName,
          taskType: formData.taskType,
          client: formData.client,
          languages: formData.languages, // store as string directly
          startTime: startStr,
          endTime: endStr,
          duration,
          notes: formData.notes,
        });
        toast.success("Time record saved successfully!");
        refetchRecords();
      } catch (error: any) {
        // Surface Supabase error details for easier debugging
        console.error("Failed to save time record (live timer):", error);
        const message =
          error?.message ??
          error?.error?.message ??
          "Failed to save time record";
        toast.error(message);
      }
    }

    setTimerRunning(false);
    setTimerStart(null);
    setElapsedSeconds(0);
    localStorage.removeItem("employeeLiveTimer");
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate duration and overtime
    const [startHour, startMin] = formData.startTime.split(":").map(Number);
    const [endHour, endMin] = formData.endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    let durationMinutes = endMinutes - startMinutes;
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60;
    }

    const duration = Math.round((durationMinutes / 60) * 100) / 100;

    // Business hours: 10 AM to 6 PM (10:00 to 18:00)
    const businessStartMinutes = 10 * 60; // 10:00 AM
    const businessEndMinutes = 18 * 60; // 6:00 PM

    let businessDayTime = 0;
    let overtime = 0;

    if (
      startMinutes >= businessEndMinutes ||
      endMinutes <= businessStartMinutes
    ) {
      overtime = duration;
    } else if (
      startMinutes >= businessStartMinutes &&
      endMinutes <= businessEndMinutes
    ) {
      businessDayTime = duration;
    } else {
      const overlapStart = Math.max(startMinutes, businessStartMinutes);
      const overlapEnd = Math.min(endMinutes, businessEndMinutes);
      businessDayTime =
        Math.round(((overlapEnd - overlapStart) / 60) * 100) / 100;
      overtime = Math.round((duration - businessDayTime) * 100) / 100;
    }

    const newRecord: TimeRecord = {
      id: Date.now(),
      workDate: selectedDate,
      projectNumber: formData.projectNumber,
      projectName: formData.projectName,
      taskType: formData.taskType,
      client: formData.client,
      languages: formData.languages, // store as string directly
      startTime: formData.startTime,
      endTime: formData.endTime,
      duration,
      businessDayTime,
      overtime,
    };

    // Save to database
    if (employeeId) {
      try {
        await createRecordMutation.mutateAsync({
          employeeId,
          workDate: new Date(selectedDate),
          projectNumber: formData.projectNumber,
          projectName: formData.projectName,
          taskType: formData.taskType,
          client: formData.client,
          languages: formData.languages, // store as string directly
          startTime: formData.startTime,
          endTime: formData.endTime,
          duration,
          notes: formData.notes,
        });
        toast.success("Time record saved successfully!");
        refetchRecords();
      } catch (error: any) {
        // Surface Supabase error details for easier debugging
        console.error("Failed to save time record (manual):", error);
        const message =
          error?.message ??
          error?.error?.message ??
          "Failed to save time record";
        toast.error(message);
      }
    }

    setShowForm(false);
    setFormData({
      projectNumber: "",
      projectName: "",
      taskType: "translation",
      client: "",
      languages: "",
      startTime: "10:00",
      endTime: "18:00",
      notes: "",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("employeeSession");
    localStorage.removeItem("employeeEmail");
    setLocation("/");
  };

  const handleDeleteRecord = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteRecordMutation.mutateAsync(id);
      toast.success("Record deleted successfully!");
      refetchRecords();
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const totalHours = records.reduce((sum, r) => sum + r.duration, 0);
  const totalBusinessHours = records.reduce(
    (sum, r) => sum + r.businessDayTime,
    0
  );
  const totalOvertime = records.reduce((sum, r) => sum + r.overtime, 0);

  // Calculate additional statistics
  const uniqueDays = new Set(records.map(r => r.workDate)).size;
  const uniqueProjects = new Set(
    records.filter(r => r.projectName).map(r => r.projectName)
  ).size;
  const averageHoursPerDay =
    uniqueDays > 0 ? (totalHours / uniqueDays).toFixed(2) : "0.00";
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Month selection for reports
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().split("T")[0].substring(0, 7)
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  const reportMonth = parseInt(selectedMonth.split("-")[1]);
  const reportYear = parseInt(selectedMonth.split("-")[0]);

  const thisMonthRecords = records.filter(r => {
    const recordDate = new Date(r.workDate);
    return (
      recordDate.getMonth() + 1 === reportMonth &&
      recordDate.getFullYear() === reportYear
    );
  });
  const thisMonthHours = thisMonthRecords.reduce(
    (sum, r) => sum + r.duration,
    0
  );
  const thisMonthBusinessHours = thisMonthRecords.reduce(
    (sum, r) => sum + r.businessDayTime,
    0
  );
  const thisMonthOvertime = thisMonthRecords.reduce(
    (sum, r) => sum + r.overtime,
    0
  );

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
                <h1 className="font-bold text-gray-900">Time Tracking</h1>
                <p className="text-xs text-gray-600">Employee Portal</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowReport(!showReport)}
              className="rounded-full hover:bg-blue-50 hover:text-blue-600 border-gray-200"
            >
              <Clock size={18} className="mr-2" />
              {showReport ? "Hide Report" : "Detailed Report"}
            </Button>
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Hours",
              value: totalHours.toFixed(2),
              subtitle: "All tracked hours",
              color: "text-blue-600",
            },
            {
              title: "Business Hours",
              value: totalBusinessHours.toFixed(2),
              subtitle: "10 AM - 6 PM",
              color: "text-green-600",
            },
            {
              title: "Overtime",
              value: totalOvertime.toFixed(2),
              subtitle: "Outside business hours",
              color: "text-orange-600",
            },
            {
              title: "This Month",
              value: thisMonthHours.toFixed(2),
              subtitle: "Hours this month",
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
                  <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Report Section */}
        {showReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock size={20} className="text-blue-600" />
                    Monthly Report
                  </span>
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of your time for the selected month
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Month Selector */}
                <div className="mb-6">
                  <Label htmlFor="reportMonth">Select Month</Label>
                  <Input
                    id="reportMonth"
                    type="month"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="rounded-xl bg-white/50 max-w-xs"
                  />
                </div>

                {/* Monthly Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {thisMonthHours.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Business Hours</p>
                    <p className="text-2xl font-bold text-green-600">
                      {thisMonthBusinessHours.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Overtime</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {thisMonthOvertime.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">Days Worked</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {new Set(thisMonthRecords.map(r => r.workDate)).size}
                    </p>
                  </div>
                </div>

                {/* Monthly Records Table */}
                {thisMonthRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">
                            Date
                          </th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">
                            Project
                          </th>
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">
                            Task
                          </th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-700">
                            Hours
                          </th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-700">
                            Business
                          </th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-700">
                            Overtime
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {thisMonthRecords
                          .sort(
                            (a, b) =>
                              new Date(b.workDate).getTime() -
                              new Date(a.workDate).getTime()
                          )
                          .map((record, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-3 px-2">{record.workDate}</td>
                              <td className="py-3 px-2">
                                {record.projectName ||
                                  record.projectNumber ||
                                  "-"}
                              </td>
                              <td className="py-3 px-2 capitalize">
                                {record.taskType || "-"}
                              </td>
                              <td className="py-3 px-2 text-right">
                                {record.duration.toFixed(2)}
                              </td>
                              <td className="py-3 px-2 text-right text-green-600">
                                {record.businessDayTime.toFixed(2)}
                              </td>
                              <td className="py-3 px-2 text-right text-orange-600">
                                {record.overtime.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-semibold">
                          <td className="py-3 px-2" colSpan={3}>
                            Total
                          </td>
                          <td className="py-3 px-2 text-right">
                            {thisMonthHours.toFixed(2)}
                          </td>
                          <td className="py-3 px-2 text-right text-green-600">
                            {thisMonthBusinessHours.toFixed(2)}
                          </td>
                          <td className="py-3 px-2 text-right text-orange-600">
                            {thisMonthOvertime.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No records found for {selectedMonth}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: "Days Worked",
              value: uniqueDays,
              subtitle: "Unique days tracked",
            },
            {
              title: "Projects",
              value: uniqueProjects,
              subtitle: "Different projects",
            },
            {
              title: "Avg Hours/Day",
              value: averageHoursPerDay,
              subtitle: "Average per day",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-md rounded-3xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-700">
                    {item.value}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.65 }}
        >
          <Card className="bg-white/90 backdrop-blur-md border-white/20 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-blue-50/30">
              <CardTitle>Live Timer</CardTitle>
              <CardDescription>Track real work time</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Clock className="w-8 h-8 text-blue-700" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold tracking-tight text-gray-900">
                      {formatElapsed(elapsedSeconds)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {timerRunning ? "Running" : "Stopped"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!timerRunning ? (
                    <Button
                      onClick={startLiveTimer}
                      className="bg-green-600 hover:bg-green-700 rounded-full px-6 h-11"
                    >
                      <Play size={18} className="mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button
                      onClick={stopLiveTimer}
                      className="bg-red-600 hover:bg-red-700 rounded-full px-6 h-11"
                    >
                      <StopCircle size={18} className="mr-2" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timerTaskType">Task Type</Label>
                  <select
                    id="timerTaskType"
                    value={formData.taskType}
                    onChange={e =>
                      setFormData({ ...formData, taskType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 h-10"
                  >
                    <option value="translation">Translation</option>
                    <option value="review">Review</option>
                    <option value="qa">QA</option>
                    <option value="desktop_publishing">
                      Desktop Publishing
                    </option>
                    <option value="voiceover">Voice Over</option>
                    <option value="subtitle">Subtitle</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timerProjectNumber">Project Number</Label>
                  <Input
                    id="timerProjectNumber"
                    placeholder="e.g., PROJ-2024-001"
                    value={formData.projectNumber}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        projectNumber: e.target.value,
                      })
                    }
                    className="rounded-xl bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timerProjectName">Project Name</Label>
                  <Input
                    id="timerProjectName"
                    placeholder="e.g., Website Localization"
                    value={formData.projectName}
                    onChange={e =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                    className="rounded-xl bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timerClient">Client</Label>
                  <Input
                    id="timerClient"
                    placeholder="e.g., Acme Corp"
                    value={formData.client}
                    onChange={e =>
                      setFormData({ ...formData, client: e.target.value })
                    }
                    className="rounded-xl bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages</Label>
                  <Input
                    id="languages"
                    type="text"
                    placeholder="e.g., English, French, German"
                    value={formData.languages}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        languages: e.target.value,
                      })
                    }
                    className="bg-white/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Record Button */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg shadow-blue-600/20 px-6 h-12 text-lg"
          >
            {showForm ? (
              <X size={18} className="mr-2" />
            ) : (
              <Plus size={18} className="mr-2" />
            )}
            {showForm ? "Close Form" : "Add Time Entry"}
          </Button>
        </motion.div>

        {/* Add Record Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <Card className="bg-white/90 backdrop-blur-md border-white/20 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-blue-50/30">
                  <CardTitle>Add Time Entry</CardTitle>
                  <CardDescription>
                    Record your work time for a project
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleAddRecord} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="workDate">Work Date</Label>
                        <Input
                          id="workDate"
                          type="date"
                          value={selectedDate}
                          onChange={e => setSelectedDate(e.target.value)}
                          required
                          className="rounded-xl bg-white/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taskType">Task Type</Label>
                        <select
                          id="taskType"
                          value={formData.taskType}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              taskType: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 h-10"
                        >
                          <option value="translation">Translation</option>
                          <option value="review">Review</option>
                          <option value="qa">QA</option>
                          <option value="desktop_publishing">
                            Desktop Publishing
                          </option>
                          <option value="voiceover">Voice Over</option>
                          <option value="subtitle">Subtitle</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="projectNumber">Project Number</Label>
                        <Input
                          id="projectNumber"
                          placeholder="e.g., PROJ-2024-001"
                          value={formData.projectNumber}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              projectNumber: e.target.value,
                            })
                          }
                          className="rounded-xl bg-white/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="projectName">Project Name</Label>
                        <Input
                          id="projectName"
                          placeholder="e.g., Website Localization"
                          value={formData.projectName}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              projectName: e.target.value,
                            })
                          }
                          className="rounded-xl bg-white/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="client">Client</Label>
                        <Input
                          id="client"
                          placeholder="e.g., Acme Corp"
                          value={formData.client}
                          onChange={e =>
                            setFormData({ ...formData, client: e.target.value })
                          }
                          className="rounded-xl bg-white/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="languages2">Languages</Label>
                        <Input
                          id="languages2"
                          type="text"
                          placeholder="e.g., English, French, German"
                          value={formData.languages}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              languages: e.target.value,
                            })
                          }
                          className="bg-white/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              startTime: e.target.value,
                            })
                          }
                          required
                          className="rounded-xl bg-white/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              endTime: e.target.value,
                            })
                          }
                          required
                          className="rounded-xl bg-white/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <textarea
                        id="notes"
                        placeholder="Add any additional notes about this time entry"
                        value={formData.notes}
                        onChange={e =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 rounded-full px-8"
                      >
                        <Save size={18} className="mr-2" />
                        Save Entry
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
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

        {/* Records List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Time Entries</h2>
            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm">
              {records.length} entries
            </span>
          </div>

          {records.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-lg rounded-3xl">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">
                  No time entries yet.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Add your first entry above to start tracking time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {records.map((record, idx) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-md hover:shadow-lg transition-shadow rounded-2xl overflow-hidden">
                      <CardContent className="pt-6 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                              Date & Time
                            </p>
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-blue-500" />
                              <span className="font-semibold text-gray-900">
                                {record.workDate}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Clock size={14} />
                              <span>
                                {record.startTime} - {record.endTime}
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                              Task Info
                            </p>
                            <div className="flex items-center gap-2">
                              <Briefcase
                                size={16}
                                className="text-purple-500"
                              />
                              <span className="font-semibold capitalize text-gray-900">
                                {record.taskType.replace("_", " ")}
                              </span>
                            </div>
                            {record.projectName && (
                              <div
                                className="text-sm text-gray-600 mt-1 truncate"
                                title={record.projectName}
                              >
                                {record.projectName}
                              </div>
                            )}
                          </div>

                          <div className="md:col-span-2 lg:col-span-2 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                                <p className="text-xs font-bold uppercase">
                                  Duration
                                </p>
                                <p className="text-xl font-bold">
                                  {record.duration}h
                                </p>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                  <span className="text-gray-600">
                                    Business:
                                  </span>
                                  <span className="font-semibold text-gray-900">
                                    {record.businessDayTime}h
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                  <span className="text-gray-600">
                                    Overtime:
                                  </span>
                                  <span className="font-semibold text-gray-900">
                                    {record.overtime}h
                                  </span>
                                </div>
                              </div>
                            </div>

                            {(record.client || record.projectNumber) && (
                              <div className="text-right text-sm">
                                {record.client && (
                                  <p className="font-medium text-gray-900">
                                    {record.client}
                                  </p>
                                )}
                                {record.projectNumber && (
                                  <p className="font-mono text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 inline-block mt-1">
                                    {record.projectNumber}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <div className="px-6 pb-6 flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="rounded-full hover:bg-red-50 hover:text-red-600 border-gray-200"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
