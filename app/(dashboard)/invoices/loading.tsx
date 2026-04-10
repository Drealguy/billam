import { Skeleton } from "@/components/skeleton";

export default function InvoicesLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      {/* Invoice rows */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-5 py-4 ${i !== 0 ? "border-t border-border" : ""}`}
          >
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-2.5 w-24" />
            </div>
            <Skeleton className="h-3 w-24 hidden md:block" />
            <Skeleton className="h-3 w-20 hidden md:block" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
