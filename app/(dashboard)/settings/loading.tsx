import { Skeleton } from "@/components/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3 w-56" />
      </div>

      {/* Section 1 */}
      <div className="space-y-5">
        <div className="border-b border-border pb-3 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <Skeleton className="h-11 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>

      {/* Section 2 */}
      <div className="space-y-5">
        <div className="border-b border-border pb-3 space-y-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>

      {/* Save button */}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}
