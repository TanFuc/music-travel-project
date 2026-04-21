import { cn } from '@/lib/utils';
const skeletonBase = 'animate-pulse bg-gray-200 rounded';
export function HeroBannerSkeleton() {
  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-gray-100 md:h-screen">
      <div className={cn(skeletonBase, 'absolute inset-0')} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-4xl space-y-6 px-4 text-center">
          <div className={cn(skeletonBase, 'mx-auto h-8 w-32 rounded-full')} />
          <div className={cn(skeletonBase, 'mx-auto h-16 w-3/4')} />
          <div className="flex justify-center gap-4">
            <div className={cn(skeletonBase, 'h-10 w-40')} />
            <div className={cn(skeletonBase, 'h-10 w-40')} />
          </div>
          <div className={cn(skeletonBase, 'mx-auto h-14 w-48 rounded-2xl')} />
        </div>
      </div>
    </section>
  );
}
export function LocationFilterSkeleton() {
  return (
    <div className="sticky top-[72px] z-40 py-3">
      <div className="container mx-auto px-4">
        <div className="scrollbar-hide flex items-center gap-6 overflow-x-auto pb-2">
          <div className="flex shrink-0 items-center gap-3">
            <div className={cn(skeletonBase, 'h-8 w-8 rounded-xl')} />
            <div className={cn(skeletonBase, 'hidden h-4 w-32 sm:block')} />
          </div>
          <div className="flex items-center gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={cn(skeletonBase, 'h-10 w-24 rounded-xl')} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export function ShowsSectionSkeleton() {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 flex max-w-4xl flex-col items-center space-y-6 text-center">
          <div className={cn(skeletonBase, 'h-8 w-48 rounded-full')} />
          <div className={cn(skeletonBase, 'h-12 w-80')} />
          <div className={cn(skeletonBase, 'h-6 w-96')} />
          <div className={cn(skeletonBase, 'h-12 w-full max-w-md rounded-xl')} />
        </div>

        <div className="mb-8 flex justify-center gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={cn(skeletonBase, 'h-12 w-32 rounded-2xl')} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <ShowCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
export function ShowCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className={cn(skeletonBase, 'aspect-[3/4]')} />
      <div className="space-y-4 p-6">
        <div className={cn(skeletonBase, 'h-6 w-3/4')} />
        <div className={cn(skeletonBase, 'h-4 w-1/2')} />
        <div className={cn(skeletonBase, 'h-4 w-2/3')} />
        <div className={cn(skeletonBase, 'h-10 w-full rounded-xl')} />
      </div>
    </div>
  );
}
export function StagesSectionSkeleton() {
  return (
    <section className="bg-brand-50/50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className={cn(skeletonBase, 'mx-auto mb-4 h-14 w-14 rounded-2xl')} />
          <div className={cn(skeletonBase, 'mx-auto mb-4 h-10 w-80')} />
          <div className={cn(skeletonBase, 'mx-auto h-6 w-96')} />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[2rem] bg-white shadow-lg">
              <div className={cn(skeletonBase, 'aspect-[4/3]')} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function ToursSectionSkeleton() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className={cn(skeletonBase, 'mx-auto mb-4 h-14 w-14 rounded-2xl')} />
          <div className={cn(skeletonBase, 'mx-auto mb-4 h-10 w-80')} />
          <div className={cn(skeletonBase, 'mx-auto h-6 w-96')} />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <TourCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
export function TourCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
      <div className={cn(skeletonBase, 'aspect-[16/9]')} />
      <div className="space-y-4 p-6 md:p-8">
        <div className={cn(skeletonBase, 'h-7 w-3/4')} />
        <div className="space-y-2">
          <div className={cn(skeletonBase, 'h-5 w-48')} />
          <div className={cn(skeletonBase, 'h-5 w-40')} />
        </div>
        <div className="flex justify-between border-t border-dashed border-gray-200 pt-6">
          <div>
            <div className={cn(skeletonBase, 'mb-2 h-4 w-20')} />
            <div className={cn(skeletonBase, 'h-8 w-32')} />
          </div>
          <div className={cn(skeletonBase, 'h-10 w-10 rounded-full')} />
        </div>
      </div>
    </div>
  );
}
export function ShowsGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <ShowCardSkeleton key={i} />
      ))}
    </div>
  );
}
export function ShowDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={cn(skeletonBase, 'h-[400px] w-full')} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className={cn(skeletonBase, 'h-8 w-3/4')} />
            <div className={cn(skeletonBase, 'h-40 w-full rounded-xl')} />
            <div className={cn(skeletonBase, 'h-60 w-full rounded-xl')} />
          </div>

          <div className="lg:col-span-1">
            <div className={cn(skeletonBase, 'h-[400px] w-full rounded-xl')} />
          </div>
        </div>
      </div>
    </div>
  );
}
export function ToursGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <TourCardSkeleton key={i} />
      ))}
    </div>
  );
}
export function TourDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={cn(skeletonBase, 'h-[400px] w-full')} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className={cn(skeletonBase, 'h-8 w-3/4')} />
            <div className={cn(skeletonBase, 'h-60 w-full rounded-xl')} />
          </div>

          <div className="lg:col-span-1">
            <div className={cn(skeletonBase, 'h-[300px] w-full rounded-xl')} />
          </div>
        </div>
      </div>
    </div>
  );
}
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-8">
      <div className={cn(skeletonBase, 'h-6 w-48')} />

      <section>
        <div className={cn(skeletonBase, 'mb-4 h-8 w-32')} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <ShowCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section>
        <div className={cn(skeletonBase, 'mb-4 h-8 w-24')} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <TourCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto space-y-8 px-4">
        <div className={cn(skeletonBase, 'h-12 w-64')} />
        <div className={cn(skeletonBase, 'h-6 w-96')} />
        <div className={cn(skeletonBase, 'h-[400px] w-full rounded-xl')} />
      </div>
    </div>
  );
}
export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className={cn(skeletonBase, 'aspect-[4/3]')} />
          <div className="space-y-3 p-4">
            <div className={cn(skeletonBase, 'h-5 w-3/4')} />
            <div className={cn(skeletonBase, 'h-4 w-1/2')} />
          </div>
        </div>
      ))}
    </div>
  );
}
