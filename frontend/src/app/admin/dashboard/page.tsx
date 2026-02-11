import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { StatsSkeleton, RevenueSkeleton, BookingsSkeleton } from './components/Skeletons';

// Dynamic import for client-side rendering with code splitting
const DashboardContent = dynamic(
  () => import('./components/DashboardContent').then(mod => ({ default: mod.DashboardContent })),
  {
    ssr: false,
    loading: () => <DashboardSkeleton />,
  }
);

// Full page skeleton for initial load
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-white">
      <div className="space-y-6 lg:space-y-8 pb-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-5 w-64 bg-slate-100 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-slate-200 rounded-full animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
        <StatsSkeleton />

        {/* Revenue Skeleton */}
        <RevenueSkeleton />

        {/* Bookings Skeleton */}
        <BookingsSkeleton />
      </div>
    </div>
  );
}

// Server Component - No JavaScript sent to client for this shell
export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
