import { Skeleton } from "@/components/skeleton";

export default function InvoiceDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Link bar */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Invoice preview skeleton */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl overflow-hidden space-y-0">
          <Skeleton className="h-28 w-full rounded-none" />
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
            <Skeleton className="h-px w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
