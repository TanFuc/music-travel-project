import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { StatsSkeleton, RevenueSkeleton, BookingsSkeleton } from './components/Skeletons';
const DashboardContent = dynamic(
  () => import('./components/DashboardContent').then((mod) => ({ default: mod.DashboardContent })),
  {
    ssr: false,
    loading: () => <DashboardSkeleton />,
  }
);
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-white">
      <div className="space-y-6 pb-8 lg:space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className="h-10 w-48 animate-pulse rounded bg-slate-200"></div>
            <div className="h-5 w-64 animate-pulse rounded bg-slate-100"></div>
          </div>
          <div className="h-10 w-40 animate-pulse rounded-full bg-slate-200"></div>
        </div>

        <StatsSkeleton />

        <RevenueSkeleton />

        <BookingsSkeleton />
      </div>
    </div>
  );
}
export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
