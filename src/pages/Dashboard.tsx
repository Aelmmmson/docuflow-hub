// src/pages/Dashboard.tsx
import { FileText, FileCheck, FileX, FileClock } from "lucide-react";
import { FolderCard } from "@/components/dashboard/FolderCard";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { CategoriesChart } from "@/components/dashboard/CategoriesChart";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ────────────────────────────────────────────────
//  Types (based on backend response)
// ────────────────────────────────────────────────
export interface RecentDoc {
  id: number;
  doctype_id: number;
  branch: string;
  requested_amount: string;
  approved_amount: string | null;
  customer_no: string;
  customer_desc: string;
  details: string;
  doc_id: string;
  batch_no: string | null;
  transaction_date: string | null;
  is_transaction_failed: number;
  is_approved: number;
  posted_by: string;
  status: string;
  approval_stage: string;
  current_approvers: number | null;
  is_required_approvers_left: number;
  decline_reason: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  stage_updated_at: string;
  doctype_name: string;
}

export interface ExpenseItem {
  id: number;
  requested_amount: number;
  description: string;
  color_code: string;
}

export interface CategoryItem {
  quantity: number;
  description: string;
  color_code: string;
}

interface DashboardCounts {
  rejected_docs: number;
  unapproved_docs: number;
  approved_docs: number;
  total_docs: number;
}

interface DashboardResponse {
  result: {
    counts: DashboardCounts;
    recent_documents: RecentDoc[];
    amount_by_category: ExpenseItem[];
    docs_by_category: CategoryItem[];
  };
  status: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [cardData, setCardData] = useState([
    {
      id: 1,
      count: 0,
      label: "File(s)",
      title: "Generated",
      color: {
        tab: "from-blue-300 to-blue-300",
        body: "bg-gradient-to-t from-blue-50 to-white dark:from-blue-950/50 dark:to-card",
        layer1: "bg-blue-50 dark:bg-blue-900/30",
        layer2: "bg-blue-200 dark:bg-blue-800/40",
      },
      iconColor: "#60A5FA",
      icon: <FileText className="w-full h-full" />,
      backgroundIcon: (
        <svg className="w-52 h-52 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      ),
    },
    {
      id: 2,
      count: 0,
      label: "File(s)",
      title: "Approved",
      color: {
        tab: "from-emerald-300 to-emerald-300",
        body: "bg-gradient-to-t from-emerald-50 to-white dark:from-emerald-950/50 dark:to-card",
        layer1: "bg-emerald-50 dark:bg-emerald-900/30",
        layer2: "bg-emerald-200 dark:bg-emerald-800/40",
      },
      iconColor: "#34D399",
      icon: <FileCheck className="w-full h-full" />,
      backgroundIcon: (
        <svg className="w-52 h-52 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      ),
    },
    {
      id: 3,
      count: 0,
      label: "File(s)",
      title: "Pending Approval",
      color: {
        tab: "from-amber-300 to-amber-300",
        body: "bg-gradient-to-t from-amber-50 to-white dark:from-amber-950/50 dark:to-card",
        layer1: "bg-amber-50 dark:bg-amber-900/30",
        layer2: "bg-amber-200 dark:bg-amber-800/40",
      },
      iconColor: "#FBBF24",
      icon: <FileClock className="w-full h-full" />,
      backgroundIcon: (
        <svg className="w-52 h-52 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      ),
    },
    {
      id: 4,
      count: 0,
      label: "File(s)",
      title: "Rejected",
      color: {
        tab: "from-rose-300 to-rose-300",
        body: "bg-gradient-to-t from-rose-50 to-white dark:from-rose-950/50 dark:to-card",
        layer1: "bg-rose-50 dark:bg-rose-900/30",
        layer2: "bg-rose-200 dark:bg-rose-800/40",
      },
      iconColor: "#F43F5E",
      icon: <FileX className="w-full h-full" />,
      backgroundIcon: (
        <svg className="w-52 h-52 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      ),
    },
  ]);

  const currentUser = getCurrentUser();
  const userName = currentUser ? currentUser.first_name : "User";
  const userId = currentUser?.user_id || 1;
  const role = currentUser?.role_name?.toLowerCase() || "admin";

  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([]);
  const [expensesData, setExpensesData] = useState<ExpenseItem[]>([]);
  const [categoriesData, setCategoriesData] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

useEffect(() => {
  async function fetchDashboardData() {
    try {
      const res = await api.get<DashboardResponse>(`/get-dashboard-stats/${userId}/${role}`);
      
      // Use type assertion or default values to handle the response
      const data = res.data.result || {
        counts: {
          rejected_docs: 0,
          unapproved_docs: 0,
          approved_docs: 0,
          total_docs: 0
        },
        recent_documents: [],
        amount_by_category: [],
        docs_by_category: []
      };
      
      console.log("Raw dashboard result:", data);

      // Extract counts from the counts object with safe defaults
      const rejected = data.counts?.rejected_docs ?? 0;
      const unapproved = data.counts?.unapproved_docs ?? 0;
      const approved = data.counts?.approved_docs ?? 0;
      const generated = data.counts?.total_docs ?? 0;

      // Update cards
      setCardData((prev) => prev.map((card, index) => ({
        ...card,
        count: [generated, approved, unapproved, rejected][index],
      })));

      // Update charts and recent data
      setRecentDocs(data.recent_documents ?? []);
      setExpensesData(data.amount_by_category ?? []);
      setCategoriesData(data.docs_by_category ?? []);
    } catch (err: unknown) {
      console.error("[DASHBOARD] Fetch failed:", err);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  fetchDashboardData();
}, [userId, role, toast]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 lg:p-6 pt-14 lg:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="animate-fade-in">
          <h1 className="text-lg font-bold text-foreground">
            Welcome, {userName}
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your documents efficiently
          </p>
        </div>
        <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="text-right">
            <p className="text-xs font-medium text-foreground">{formatDate(currentTime)}</p>
            <p className="text-xs text-muted-foreground font-mono">{formatTime(currentTime)}</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cardData.map((card, index) => (
          <div key={card.id} className="group flex flex-col items-center justify-center">
            <FolderCard
              count={card.count}
              label={card.label}
              title={card.title}
              color={card.color}
              iconColor={card.iconColor}
              icon={card.icon}
              backgroundIcon={card.backgroundIcon}
              delay={index * 100}
            />
          </div>
        ))}
      </div>

      {/* Charts and Recent Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-32">
        <div className="lg:col-span-1">
          <RecentDocuments recentDocs={recentDocs} />
        </div>
        <div className="lg:col-span-1">
          <ExpensesChart expensesData={expensesData} />
        </div>
        <div className="lg:col-span-1">
          <CategoriesChart categoriesData={categoriesData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;