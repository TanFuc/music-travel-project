import { ShowCardSkeleton } from '@/components/common/LoadingSkeleton';

export default function ShowsLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="h-10 w-64 bg-neutral-200 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-96 bg-neutral-100 rounded animate-pulse" />
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md h-10 bg-neutral-100 rounded-lg animate-pulse" />
        <div className="w-full sm:w-48 h-10 bg-neutral-100 rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <ShowCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
