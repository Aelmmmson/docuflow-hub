import { Skeleton } from "@/components/ui/skeleton";

export function DocumentCaptureSkeleton() {
  return (
    <div className="p-4 lg:p-6 pt-14 lg:pt-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <Skeleton className="h-9 w-full rounded-lg" />
          
          {/* Form Card */}
          <div className="rounded-xl bg-card p-4 shadow-card-md">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-32 w-full rounded-lg border-2 border-dashed" />
              </div>
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Templates */}
          <div className="rounded-xl bg-card p-4 shadow-card-md">
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/50">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Uploads */}
          <div className="rounded-xl bg-card p-4 shadow-card-md">
            <Skeleton className="h-5 w-28 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/50">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
