import { ShowCardSkeleton } from '@/components/common/LoadingSkeleton';
export default function ShowsLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <div className="mb-2 h-10 w-64 animate-pulse rounded-lg bg-neutral-200" />
        <div className="h-5 w-96 animate-pulse rounded bg-neutral-100" />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="h-10 max-w-md flex-1 animate-pulse rounded-lg bg-neutral-100" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-neutral-100 sm:w-48" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <ShowCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
