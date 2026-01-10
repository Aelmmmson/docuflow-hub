import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="p-4 lg:p-6 pt-14 lg:pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-4 w-44 ml-auto" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative w-full max-w-[240px] h-40">
            <Skeleton className="w-20 h-4 rounded-t-2xl mb-0" />
            <Skeleton className="w-full h-[156px] rounded-2xl rounded-tl-none" />
          </div>
        ))}
      </div>

      {/* Charts and Recent Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card p-4 shadow-card-md">
          <Skeleton className="h-5 w-32 mb-3" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card-md">
          <Skeleton className="h-5 w-28 mb-3" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card-md">
          <Skeleton className="h-5 w-36 mb-3" />
          <Skeleton className="h-[200px] w-full rounded-full mx-auto" style={{ maxWidth: 200 }} />
        </div>
      </div>
    </div>
  );
}
