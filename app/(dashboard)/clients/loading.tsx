import { Skeleton } from "@/components/skeleton";

export default function ClientsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-44" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Client cards */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-36" />
              <div className="flex gap-4">
                <Skeleton className="h-2.5 w-32" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
