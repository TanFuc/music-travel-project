import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-brand-100', className)}
      {...props}
    />
  );
}

// Card Skeleton for shows/tours
export function CardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-white border border-brand-100 shadow-sm">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between items-center pt-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Grid of card skeletons
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Hero banner skeleton
export function HeroBannerSkeleton() {
  return (
    <div className="relative h-[500px] md:h-[600px] w-full">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-3/4 max-w-xl" />
        <div className="flex gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-12 w-40 rounded-full" />
      </div>
    </div>
  );
}

// Profile skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}

// Table skeleton for admin
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

// Section header skeleton
export function SectionHeaderSkeleton() {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32 rounded-full" />
    </div>
  );
}
