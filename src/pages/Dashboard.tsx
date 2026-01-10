import { FileText, FileCheck, FileX, FileClock } from "lucide-react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { CategoriesChart } from "@/components/dashboard/CategoriesChart";
import { useEffect, useState } from "react";

const user = {
  name: "John",
};

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

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
        <div className="text-right animate-fade-in" style={{ animationDelay: "100ms" }}>
          <p className="text-xs font-medium text-foreground">{formatDate(currentTime)}</p>
          <p className="text-xs text-muted-foreground font-mono">{formatTime(currentTime)}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <SummaryCard
          title="Generated"
          count={156}
          icon={<FileText className="h-5 w-5" />}
          variant="default"
          delay={0}
        />
        <SummaryCard
          title="Approved"
          count={89}
          icon={<FileCheck className="h-5 w-5" />}
          variant="success"
          delay={50}
        />
        <SummaryCard
          title="Unapproved"
          count={42}
          icon={<FileClock className="h-5 w-5" />}
          variant="warning"
          delay={100}
        />
        <SummaryCard
          title="Rejected"
          count={25}
          icon={<FileX className="h-5 w-5" />}
          variant="destructive"
          delay={150}
        />
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
