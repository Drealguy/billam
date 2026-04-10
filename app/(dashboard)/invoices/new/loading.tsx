import { PageLoader } from "@/components/skeleton";

export default function NewInvoiceLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar skeleton */}
      <div className="sticky top-0 z-30 bg-background border-b border-border h-14 flex items-center px-4 md:px-8 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-16 h-4 bg-muted animate-pulse rounded" />
          <div className="hidden sm:block border-l border-border pl-3 space-y-1">
            <div className="w-24 h-3.5 bg-muted animate-pulse rounded" />
            <div className="w-32 h-2.5 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="w-28 h-8 bg-muted animate-pulse rounded-md" />
      </div>
      <PageLoader />
    </div>
  );
}
