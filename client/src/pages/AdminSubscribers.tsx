import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  FileText,
  Mail,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

type TabType = "leads" | "newsletter" | "guide_requests";

export default function AdminSubscribers() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("leads");

  // Supabase leads data
  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);

  // Supabase newsletter and guide data
  const [newsletterData, setNewsletterData] = useState<any[]>([]);
  const [newsletterLoading, setNewsletterLoading] = useState(true);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [guideData, setGuideData] = useState<any[]>([]);
  const [guideLoading, setGuideLoading] = useState(true);
  const [guideError, setGuideError] = useState<string | null>(null);

  // Fetch leads from Supabase
  const fetchLeadsFromSupabase = async () => {
    setLeadsLoading(true);
    setLeadsError(null);
    try {
      const { data, error } = await supabase.from("leads").select("*");

      if (error) throw error;
      // Sort by createdat descending on client side
      const sortedData = (data || []).sort((a, b) => {
        const dateA = new Date(a.createdat || 0).getTime();
        const dateB = new Date(b.createdat || 0).getTime();
        return dateB - dateA;
      });
      setLeadsData(sortedData);
    } catch (err: any) {
      console.error("Error fetching leads from Supabase:", err);
      setLeadsError(err.message);
    } finally {
      setLeadsLoading(false);
    }
  };

  // Fetch newsletter subscriptions from Supabase
  const fetchNewsletterFromSupabase = async () => {
    setNewsletterLoading(true);
    setNewsletterError(null);
    try {
      const { data, error } = await supabase
        .from("newsletter")
        .select("*");

      if (error) throw error;
      // Sort by created_at descending on client side
      const sortedData = (data || []).sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      setNewsletterData(sortedData);
    } catch (err: any) {
      console.error("Error fetching newsletter from Supabase:", err);
      setNewsletterError(err.message);
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Fetch guide requests from Supabase
  const fetchGuideFromSupabase = async () => {
    setGuideLoading(true);
    setGuideError(null);
    try {
      const { data, error } = await supabase
        .from("newsletter_subscriptions")
        .select("*")
        .eq("type", "guide_request");

      if (error) throw error;
      // Sort by subscribedat descending on client side
      const sortedData = (data || []).sort((a, b) => {
        const dateA = new Date(a.subscribedat || 0).getTime();
        const dateB = new Date(b.subscribedat || 0).getTime();
        return dateB - dateA;
      });
      setGuideData(sortedData);
    } catch (err: any) {
      console.error("Error fetching guide requests from Supabase:", err);
      setGuideError(err.message);
    } finally {
      setGuideLoading(false);
    }
  };

  // Fetch all data on mount
  useEffect(() => {
    fetchLeadsFromSupabase();
    fetchNewsletterFromSupabase();
    fetchGuideFromSupabase();
  }, []);

  // Check if admin is logged in
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      setLocation("/solupedia-admin");
    }
  }, [setLocation]);

  // Current data based on tab
  const currentData =
    activeTab === "leads"
      ? leadsData
      : activeTab === "newsletter"
        ? newsletterData
        : guideData;
  const currentLoading =
    activeTab === "leads"
      ? leadsLoading
      : activeTab === "newsletter"
        ? newsletterLoading
        : guideLoading;
  const currentRefetch =
    activeTab === "leads"
      ? fetchLeadsFromSupabase
      : activeTab === "newsletter"
        ? fetchNewsletterFromSupabase
        : fetchGuideFromSupabase;

  // Filter data
  const allSubscribers = (currentData || []).filter((item: any) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      // For leads, search by name, email, company
      if (activeTab === "leads") {
        return (
          (item.name || "").toLowerCase().includes(search) ||
          (item.email || "").toLowerCase().includes(search) ||
          (item.company || "").toLowerCase().includes(search)
        );
      }
      // For newsletter and guide, search by email
      return getEmail(item).toLowerCase().includes(search);
    }
    return true;
  });

  // Stats
  const leadsCount = leadsData.length;
  const newsletterCount = newsletterData.length;
  const guideCount = guideData.length;
  const totalCount = leadsCount + newsletterCount + guideCount;

  // Debug: Show error if any
  const currentError =
    activeTab === "leads"
      ? leadsError
      : activeTab === "newsletter"
        ? newsletterError
        : guideError;

  const handleExportCSV = () => {
    const headers = ["Email", "Subscribed At"];
    const rows = allSubscribers.map((sub: any) => [
      getEmail(sub),
      getSubscribedDate(sub)
        ? new Date(getSubscribedDate(sub)).toLocaleString()
        : "-",
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to get name from lead
  const getName = (item: any) => item.name || "-";

  // Helper to get company from lead
  const getCompany = (item: any) => item.company || "-";

  // Helper to get phone from lead
  const getPhone = (item: any) => item.phone || "-";

  // Helper to get service interest from lead
  const getServiceInterest = (item: any) => item.serviceinterest || "-";

  // Helper to get type from lead
  const getType = (item: any) => item.type || "lead";

  // Helper to get message from lead
  const getMessage = (item: any) => item.message || "-";

  // Helper to get subscribed date from different column names
  const getSubscribedDate = (item: any) => {
    return item.subscribedat || item.created_at || item.subscribed_at || null;
  };

  // Helper to get email from different formats
  const getEmail = (item: any) => {
    if (!item) return "-";
    if (typeof item.email === "string") return item.email;
    if (typeof item.email === "object" && item.email !== null)
      return item.email.email || "-";
    return "-";
  };

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
              <Link href="/admin/employees">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-blue-50 text-blue-600"
                >
                  <ArrowLeft size={20} />
                </Button>
              </Link>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold">S</span>
              </motion.div>
              <div>
                <h1 className="font-bold text-gray-900">Subscribers & Leads</h1>
                <p className="text-xs text-gray-600">
                  Manage leads, newsletter subscribers, and guide requests
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => currentRefetch && currentRefetch()}
                className="rounded-full"
              >
                <Download size={18} className="mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="rounded-full"
              >
                <Download size={18} className="mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Leads</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {leadsCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Newsletter</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {newsletterCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Guide Requests</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {guideCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {totalCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "leads" ? "default" : "outline"}
            onClick={() => setActiveTab("leads")}
            className={activeTab === "leads" ? "bg-blue-600" : ""}
          >
            <Users size={16} className="mr-2" />
            Leads ({leadsCount})
          </Button>
          <Button
            variant={activeTab === "newsletter" ? "default" : "outline"}
            onClick={() => setActiveTab("newsletter")}
            className={activeTab === "newsletter" ? "bg-blue-600" : ""}
          >
            <Mail size={16} className="mr-2" />
            Newsletter ({newsletterCount})
          </Button>
          <Button
            variant={activeTab === "guide_requests" ? "default" : "outline"}
            onClick={() => setActiveTab("guide_requests")}
            className={activeTab === "guide_requests" ? "bg-blue-600" : ""}
          >
            <FileText size={16} className="mr-2" />
            Guide Requests ({guideCount})
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              placeholder={
                activeTab === "leads"
                  ? "Search by name, email, or company..."
                  : "Search by email..."
              }
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Error Message */}
        {currentError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            Error: {currentError}
          </div>
        )}

        {/* Subscribers Table */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>
              {activeTab === "leads"
                ? "Leads & Quote Requests"
                : activeTab === "newsletter"
                  ? "Newsletter Subscribers"
                  : "Guide Requests"}
            </CardTitle>
            <CardDescription>
              {allSubscribers.length} record(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : allSubscribers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No subscribers found
              </div>
            ) : (
              <div className="overflow-x-auto">
                {activeTab === "leads" ? (
                  // Leads table with more columns
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Company
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Phone
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Service Interest
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSubscribers.map((lead: any, idx: number) => (
                        <motion.tr
                          key={lead.id || idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm">{getName(lead)}</td>
                          <td className="py-3 px-4">
                            <a
                              href={`mailto:${getEmail(lead)}`}
                              className="text-blue-600 hover:underline"
                            >
                              {getEmail(lead)}
                            </a>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {getCompany(lead)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {getPhone(lead) !== "-" ? (
                              <a
                                href={`tel:${getPhone(lead)}`}
                                className="text-blue-600 hover:underline"
                              >
                                {getPhone(lead)}
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {getServiceInterest(lead)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                getType(lead) === "quote_request"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {getType(lead)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(lead.createdat)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  // Newsletter/Guide table (original format)
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Subscribed At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSubscribers.map((subscriber: any, idx: number) => (
                        <motion.tr
                          key={subscriber.id || idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <a
                              href={`mailto:${getEmail(subscriber)}`}
                              className="text-blue-600 hover:underline"
                            >
                              {getEmail(subscriber)}
                            </a>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(getSubscribedDate(subscriber))}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
