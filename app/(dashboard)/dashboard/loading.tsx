import { Skeleton } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-32" />
          </div>
        ))}
      </div>

      {/* Onboarding / Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <Skeleton className="h-4 w-40" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <Skeleton className="h-4 w-36" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
