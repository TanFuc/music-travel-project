'use client';
import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
export const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 bg-white shadow-md">
      <CardContent className="p-0">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200"></div>
              <div className="h-8 w-24 animate-pulse rounded bg-slate-200"></div>
              <div className="h-3 w-32 animate-pulse rounded bg-slate-100"></div>
            </div>
            <div className="h-16 w-16 flex-shrink-0 animate-pulse rounded-2xl bg-slate-200"></div>
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-100" />
      </CardContent>
    </Card>
  );
});
export const StatsSkeleton = memo(function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
});
export const RevenueCardSkeleton = memo(function RevenueCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-200 to-slate-300 shadow-xl">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-300"></div>
            <div className="h-12 w-48 animate-pulse rounded bg-slate-300"></div>
            <div className="h-4 w-40 animate-pulse rounded bg-slate-300"></div>
          </div>
          <div className="h-20 w-20 animate-pulse rounded-3xl bg-slate-300"></div>
        </div>
      </CardContent>
    </Card>
  );
});
export const RevenueSkeleton = memo(function RevenueSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <RevenueCardSkeleton />
      <RevenueCardSkeleton />
    </div>
  );
});
export const BookingCardSkeleton = memo(function BookingCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="h-6 w-28 rounded-lg bg-slate-200"></div>
          <div className="h-6 w-20 rounded-lg bg-slate-200"></div>
        </div>
        <div className="h-6 w-24 flex-shrink-0 rounded-lg bg-slate-200"></div>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-slate-200"></div>
          <div className="h-3 w-24 rounded bg-slate-100"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-slate-200"></div>
          <div className="h-3 w-20 rounded bg-slate-100"></div>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-3">
        <div className="h-3 w-40 rounded bg-slate-100"></div>
      </div>
    </div>
  );
});
export const BookingsSkeleton = memo(function BookingsSkeleton() {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200"></div>
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-200"></div>
            <div className="h-4 w-56 animate-pulse rounded bg-slate-100"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
