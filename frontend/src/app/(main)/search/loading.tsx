import { ShowCardSkeleton } from '@/components/common/LoadingSkeleton';
export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <div className="mb-4 h-10 w-32 animate-pulse rounded-lg bg-neutral-200" />
        <div className="h-11 max-w-2xl animate-pulse rounded-lg bg-neutral-100" />
      </div>

      <div className="mb-6 flex flex-wrap gap-2 sm:gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <ShowCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
