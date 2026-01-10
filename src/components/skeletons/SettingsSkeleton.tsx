import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="p-4 lg:p-6 pt-14 lg:pt-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-52" />
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-card p-4 shadow-card-md">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder Content */}
      <div className="mt-8 rounded-xl bg-card p-8 shadow-card-md max-w-3xl">
        <div className="flex flex-col items-center justify-center">
          <Skeleton className="h-14 w-14 rounded-full mb-4" />
          <Skeleton className="h-5 w-44 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
    </div>
  );
}
