import { FileText, FileCheck, FileX, FileClock } from "lucide-react";
import { FolderCard } from "@/components/dashboard/FolderCard";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { CategoriesChart } from "@/components/dashboard/CategoriesChart";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";

const user = {
  name: "John",
};

const cardData = [
  {
    id: 1,
    count: 128,
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
    count: 94,
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
  },
  {
    id: 3,
    count: 22,
    label: "File(s)",
    title: "Unapproved",
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
  },
  {
    id: 4,
    count: 12,
    label: "File(s)",
    title: "Rejected",
    color: {
      tab: "from-red-300 to-red-300",
      body: "bg-gradient-to-t from-red-50 to-white dark:from-red-950/50 dark:to-card",
      layer1: "bg-red-50 dark:bg-red-900/30",
      layer2: "bg-red-200 dark:bg-red-800/40",
    },
    iconColor: "#F87171",
    icon: <FileX className="w-full h-full" />,
    backgroundIcon: (
      <svg className="w-52 h-52 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    ),
  },
];

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Simulate loading
    const loadTimer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
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
            Welcome, {user.name}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <RecentDocuments />
        </div>
        <div className="lg:col-span-1">
          <ExpensesChart />
        </div>
        <div className="lg:col-span-1">
          <CategoriesChart />
        </div>
      </div>
    </div>
  );
}
