// src/pages/Dashboard.tsx
import {
  FileText,
  FileCheck,
  FileX,
  FileClock,
  TrendingUp,
  ClipboardList,
  X,
  Calendar,
} from "lucide-react";
import { FolderCard } from "@/components/dashboard/FolderCard";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { CategoriesChart } from "@/components/dashboard/CategoriesChart";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DateFilter } from "@/components/shared/DateFilter";
import { DateRange, PresetKey, getPresetRange, fmtDisplay } from "@/lib/dateUtils";

// ────────────────────────────────────────────────
//  Types
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

// ────────────────────────────────────────────────
//  Stat Card Modal
// ────────────────────────────────────────────────
interface StatCardMeta {
  id: number;
  title: string;
  count: number;
  label: string;
  iconColor: string;
  icon: ReactNode;
  description: string;
  insight: string;
  statusList: string[];
  accentFrom: string;
  accentTo: string;
}

interface StatModalProps {
  card: StatCardMeta | null;
  onClose: () => void;
  dateLabel: string;
}

function StatModal({ card, onClose, dateLabel }: StatModalProps) {
  // close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Accent top bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(to right, ${card.accentFrom}, ${card.accentTo})` }}
        />

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${card.accentFrom}22`, color: card.iconColor }}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-foreground leading-tight">
                {card.count}
                <span className="text-sm font-medium text-muted-foreground ml-1">{card.label}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mx-5" />

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Date context */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Period: <span className="font-semibold text-foreground">{dateLabel}</span></span>
          </div>

          {/* Description */}
          <div className="rounded-xl bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
          </div>

          {/* Insight row */}
          <div className="flex items-start gap-2.5 rounded-xl border border-border px-4 py-3 bg-background">
            <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" style={{ color: card.iconColor }} />
            <p className="text-xs text-foreground leading-relaxed">{card.insight}</p>
          </div>

          {/* Status tags included */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <ClipboardList className="w-3 h-3" /> Counted statuses
            </p>
            <div className="flex flex-wrap gap-1.5">
              {card.statusList.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border"
                  style={{
                    backgroundColor: `${card.accentFrom}18`,
                    color: card.iconColor,
                    borderColor: `${card.accentFrom}40`,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ background: `linear-gradient(to right, ${card.accentFrom}, ${card.accentTo})` }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
const Dashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // ── Modal state ───────────────────────────────
  const [openModalCard, setOpenModalCard] = useState<StatCardMeta | null>(null);

  // ── Card data ─────────────────────────────────
  const [counts, setCounts] = useState({ total: 0, approved: 0, unapproved: 0, rejected: 0 });

  const buildCardData = (c: typeof counts) => [
    {
      id: 1, count: c.total, label: "File(s)", title: "Generated",
      color: {
        tab: "from-blue-300 to-blue-300",
        body: "bg-gradient-to-t from-blue-50 to-white dark:from-blue-950/50 dark:to-card",
        layer1: "bg-blue-50 dark:bg-blue-900/30",
        layer2: "bg-blue-200 dark:bg-blue-800/40",
      },
      iconColor: "#60A5FA",
      icon: <FileText className="w-full h-full" />,
      modalIcon: <FileText className="w-5 h-5" />,
      backgroundIcon: (
        <svg className="w-52 h-52 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      accentFrom: "#60A5FA",
      accentTo: "#3B82F6",
      description: "Total number of request documents created within the selected period, regardless of their current status.",
      insight: "This is the combined count of all requests — approved, pending, and rejected — giving you an overall activity snapshot.",
      statusList: ["APPROVED", "PAID", "PENDING", "DRAFT", "SUBMITTED", "REJECTED"],
    },
    {
      id: 2, count: c.approved, label: "File(s)", title: "Approved",
      color: {
        tab: "from-emerald-300 to-emerald-300",
        body: "bg-gradient-to-t from-emerald-50 to-white dark:from-emerald-950/50 dark:to-card",
        layer1: "bg-emerald-50 dark:bg-emerald-900/30",
        layer2: "bg-emerald-200 dark:bg-emerald-800/40",
      },
      iconColor: "#34D399",
      icon: <FileCheck className="w-full h-full" />,
      modalIcon: <FileCheck className="w-5 h-5" />,
      backgroundIcon: (
        <svg className="w-52 h-52 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      accentFrom: "#34D399",
      accentTo: "#10B981",
      description: "Documents that have been fully approved and/or paid within the selected period.",
      insight: "A higher count here means healthy workflow throughput. These requests have cleared all approval stages.",
      statusList: ["APPROVED", "PAID"],
    },
    {
      id: 3, count: c.unapproved, label: "File(s)", title: "Pending Approval",
      color: {
        tab: "from-amber-300 to-amber-300",
        body: "bg-gradient-to-t from-amber-50 to-white dark:from-amber-950/50 dark:to-card",
        layer1: "bg-amber-50 dark:bg-amber-900/30",
        layer2: "bg-amber-200 dark:bg-amber-800/40",
      },
      iconColor: "#FBBF24",
      icon: <FileClock className="w-full h-full" />,
      modalIcon: <FileClock className="w-5 h-5" />,
      backgroundIcon: (
        <svg className="w-52 h-52 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      accentFrom: "#FBBF24",
      accentTo: "#F59E0B",
      description: "Documents that are currently waiting for approval — including drafts, submitted, or in-progress items.",
      insight: "If this number is high relative to Approved, there may be a bottleneck in the approval workflow worth reviewing.",
      statusList: ["PENDING", "DRAFT", "SUBMITTED"],
    },
    {
      id: 4, count: c.rejected, label: "File(s)", title: "Rejected",
      color: {
        tab: "from-rose-300 to-rose-300",
        body: "bg-gradient-to-t from-rose-50 to-white dark:from-rose-950/50 dark:to-card",
        layer1: "bg-rose-50 dark:bg-rose-900/30",
        layer2: "bg-rose-200 dark:bg-rose-800/40",
      },
      iconColor: "#F43F5E",
      icon: <FileX className="w-full h-full" />,
      modalIcon: <FileX className="w-5 h-5" />,
      backgroundIcon: (
        <svg className="w-52 h-52 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      accentFrom: "#F43F5E",
      accentTo: "#E11D48",
      description: "Documents that were declined by an approver within the selected period.",
      insight: "Frequent rejections may indicate unclear submission guidelines or recurring documentation issues.",
      statusList: ["REJECTED"],
    },
  ];

  const [cardData, setCardData] = useState(buildCardData({ total: 0, approved: 0, unapproved: 0, rejected: 0 }));

  const currentUser = getCurrentUser();
  const userName = currentUser ? currentUser.first_name : "User";
  const userId = currentUser?.user_id || 1;
  const role = currentUser?.role_name?.toLowerCase() || "admin";

  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([]);
  const [expensesData, setExpensesData] = useState<ExpenseItem[]>([]);
  const [categoriesData, setCategoriesData] = useState<CategoryItem[]>([]);

  const [activeRange, setActiveRange] = useState<DateRange | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Fetch ─────────────────────────────────────
  const fetchDashboardData = useCallback(
    async (range: DateRange) => {
      setIsLoading(true);
      try {
        const res = await api.get<DashboardResponse>(
          `/get-dashboard-stats/${userId}/${role}`,
          { params: { startDate: range.startDate, endDate: range.endDate } }
        );
        const data = res.data.result || {
          counts: { rejected_docs: 0, unapproved_docs: 0, approved_docs: 0, total_docs: 0 },
          recent_documents: [], amount_by_category: [], docs_by_category: [],
        };
        const newCounts = {
          total: data.counts?.total_docs ?? 0,
          approved: data.counts?.approved_docs ?? 0,
          unapproved: data.counts?.unapproved_docs ?? 0,
          rejected: data.counts?.rejected_docs ?? 0,
        };
        setCounts(newCounts);
        setCardData(buildCardData(newCounts));
        setRecentDocs(data.recent_documents ?? []);
        setExpensesData(data.amount_by_category ?? []);
        setCategoriesData(data.docs_by_category ?? []);
      } catch (err: unknown) {
        console.error("[DASHBOARD] Fetch failed:", err);
        toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, role, toast]
  );

  useEffect(() => {
    // Manually trigger initial fetch since DateFilter no longer does it on mount
    const defaultRange = getPresetRange("today");
    setActiveRange(defaultRange);
    fetchDashboardData(defaultRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateFilterChange = (range: DateRange) => {
    setActiveRange(range);
    fetchDashboardData(range);
  };

  // ── Labels ────────────────────────────────────
  const dateLabel = activeRange
    ? (activeRange.startDate === activeRange.endDate
      ? fmtDisplay(activeRange.startDate)
      : `${fmtDisplay(activeRange.startDate)} – ${fmtDisplay(activeRange.endDate)}`)
    : "";

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="p-4 lg:p-6 pt-14 lg:pt-6">
      {/* Stat card modal */}
      <StatModal card={openModalCard} onClose={() => setOpenModalCard(null)} dateLabel={dateLabel} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="animate-fade-in">
          <h1 className="text-lg font-bold text-foreground">Welcome, <span className="capitalize">{userName}</span></h1>
          <p className="text-xs text-muted-foreground">Manage your documents efficiently</p>
        </div>
        <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="text-right">
            <p className="text-xs font-medium text-foreground">{formatDate(currentTime)}</p>
            <p className="text-xs text-muted-foreground font-mono">{formatTime(currentTime)}</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative z-[60] mb-6 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "150ms" }}>
        <DateFilter onFilterChange={handleDateFilterChange} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cardData.map((card, index) => (
          <div
            key={card.id}
            className="group flex flex-col items-center justify-center cursor-pointer"
            onClick={() =>
              setOpenModalCard({
                id: card.id,
                title: card.title,
                count: card.count,
                label: card.label,
                iconColor: card.iconColor,
                icon: card.modalIcon,
                description: card.description,
                insight: card.insight,
                statusList: card.statusList,
                accentFrom: card.accentFrom,
                accentTo: card.accentTo,
              })
            }
          >
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-14">
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