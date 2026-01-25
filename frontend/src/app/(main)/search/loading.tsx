import { ShowCardSkeleton } from '@/components/common/LoadingSkeleton';

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="h-10 w-32 bg-neutral-200 rounded-lg animate-pulse mb-4" />
        <div className="h-11 max-w-2xl bg-neutral-100 rounded-lg animate-pulse" />
      </div>

      <div className="mb-6 flex flex-wrap gap-2 sm:gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-neutral-100 rounded-lg animate-pulse" />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <ShowCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
