import { Skeleton } from "@/components/skeleton";

export default function ContractsLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
      <Skeleton className="w-16 h-16 rounded-2xl mb-6" />
      <Skeleton className="h-7 w-40 mb-3" />
      <Skeleton className="h-4 w-72 mb-2" />
      <Skeleton className="h-4 w-56 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl w-full">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
