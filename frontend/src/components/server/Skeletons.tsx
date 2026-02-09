/**
 * Server-side skeleton components for loading states
 * These are rendered on the server and shown during Suspense loading
 */

import { cn } from '@/lib/utils';

// Base skeleton animation classes
const skeletonBase = 'animate-pulse bg-gray-200 rounded';

// ============================================
// Homepage Skeletons
// ============================================

export function HeroBannerSkeleton() {
  return (
    <section className="relative h-[85vh] md:h-screen w-full overflow-hidden bg-gray-100">
      <div className={cn(skeletonBase, 'absolute inset-0')} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-4xl px-4">
          <div className={cn(skeletonBase, 'h-8 w-32 mx-auto rounded-full')} />
          <div className={cn(skeletonBase, 'h-16 w-3/4 mx-auto')} />
          <div className="flex justify-center gap-4">
            <div className={cn(skeletonBase, 'h-10 w-40')} />
            <div className={cn(skeletonBase, 'h-10 w-40')} />
          </div>
          <div className={cn(skeletonBase, 'h-14 w-48 mx-auto rounded-2xl')} />
        </div>
      </div>
    </section>
  );
}

export function LocationFilterSkeleton() {
  return (
    <div className="sticky top-[72px] z-40 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide pb-2">
          <div className="flex items-center gap-3 shrink-0">
            <div className={cn(skeletonBase, 'w-8 h-8 rounded-xl')} />
            <div className={cn(skeletonBase, 'h-4 w-32 hidden sm:block')} />
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
    <section className="py-12 md:py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-12 space-y-6">
          <div className={cn(skeletonBase, 'h-8 w-48 rounded-full')} />
          <div className={cn(skeletonBase, 'h-12 w-80')} />
          <div className={cn(skeletonBase, 'h-6 w-96')} />
          <div className={cn(skeletonBase, 'h-12 w-full max-w-md rounded-xl')} />
        </div>

        {/* Tabs Skeleton */}
        <div className="flex justify-center gap-3 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={cn(skeletonBase, 'h-12 w-32 rounded-2xl')} />
          ))}
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <div className={cn(skeletonBase, 'aspect-[3/4]')} />
      <div className="p-6 space-y-4">
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
    <section className="py-12 md:py-16 bg-brand-50/50">
      <div className="container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="mb-12 text-center">
          <div className={cn(skeletonBase, 'w-14 h-14 mx-auto mb-4 rounded-2xl')} />
          <div className={cn(skeletonBase, 'h-10 w-80 mx-auto mb-4')} />
          <div className={cn(skeletonBase, 'h-6 w-96 mx-auto')} />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-[2rem] overflow-hidden bg-white shadow-lg">
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
        {/* Header Skeleton */}
        <div className="mb-12 text-center">
          <div className={cn(skeletonBase, 'w-14 h-14 mx-auto mb-4 rounded-2xl')} />
          <div className={cn(skeletonBase, 'h-10 w-80 mx-auto mb-4')} />
          <div className={cn(skeletonBase, 'h-6 w-96 mx-auto')} />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
      <div className={cn(skeletonBase, 'aspect-[16/9]')} />
      <div className="p-6 md:p-8 space-y-4">
        <div className={cn(skeletonBase, 'h-7 w-3/4')} />
        <div className="space-y-2">
          <div className={cn(skeletonBase, 'h-5 w-48')} />
          <div className={cn(skeletonBase, 'h-5 w-40')} />
        </div>
        <div className="pt-6 border-t border-dashed border-gray-200 flex justify-between">
          <div>
            <div className={cn(skeletonBase, 'h-4 w-20 mb-2')} />
            <div className={cn(skeletonBase, 'h-8 w-32')} />
          </div>
          <div className={cn(skeletonBase, 'w-10 h-10 rounded-full')} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Shows Page Skeletons
// ============================================

export function ShowsGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ShowCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ShowDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Skeleton */}
      <div className={cn(skeletonBase, 'h-[400px] w-full')} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className={cn(skeletonBase, 'h-8 w-3/4')} />
            <div className={cn(skeletonBase, 'h-40 w-full rounded-xl')} />
            <div className={cn(skeletonBase, 'h-60 w-full rounded-xl')} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className={cn(skeletonBase, 'h-[400px] w-full rounded-xl')} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Tours Page Skeletons
// ============================================

export function ToursGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(count)].map((_, i) => (
        <TourCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TourDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Skeleton */}
      <div className={cn(skeletonBase, 'h-[400px] w-full')} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className={cn(skeletonBase, 'h-8 w-3/4')} />
            <div className={cn(skeletonBase, 'h-60 w-full rounded-xl')} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className={cn(skeletonBase, 'h-[300px] w-full rounded-xl')} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Search Page Skeletons
// ============================================

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-8">
      <div className={cn(skeletonBase, 'h-6 w-48')} />

      {/* Shows Section */}
      <section>
        <div className={cn(skeletonBase, 'h-8 w-32 mb-4')} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <ShowCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Tours Section */}
      <section>
        <div className={cn(skeletonBase, 'h-8 w-24 mb-4')} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <TourCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ============================================
// Generic Skeletons
// ============================================

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <div className={cn(skeletonBase, 'h-12 w-64')} />
        <div className={cn(skeletonBase, 'h-6 w-96')} />
        <div className={cn(skeletonBase, 'h-[400px] w-full rounded-xl')} />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
          <div className={cn(skeletonBase, 'aspect-[4/3]')} />
          <div className="p-4 space-y-3">
            <div className={cn(skeletonBase, 'h-5 w-3/4')} />
            <div className={cn(skeletonBase, 'h-4 w-1/2')} />
          </div>
        </div>
      ))}
    </div>
  );
}
