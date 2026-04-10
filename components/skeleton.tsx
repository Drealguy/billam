export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
