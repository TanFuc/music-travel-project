'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-md bg-white">
      <CardContent className="p-0">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 w-32 bg-slate-100 rounded animate-pulse"></div>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-slate-200 flex-shrink-0 animate-pulse"></div>
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-100" />
      </CardContent>
    </Card>
  );
});

export const StatsSkeleton = memo(function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
});

export const RevenueCardSkeleton = memo(function RevenueCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-200 to-slate-300">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            <div className="h-4 w-32 bg-slate-300 rounded animate-pulse"></div>
            <div className="h-12 w-48 bg-slate-300 rounded animate-pulse"></div>
            <div className="h-4 w-40 bg-slate-300 rounded animate-pulse"></div>
          </div>
          <div className="w-20 h-20 rounded-3xl bg-slate-300 animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
});

export const RevenueSkeleton = memo(function RevenueSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RevenueCardSkeleton />
      <RevenueCardSkeleton />
    </div>
  );
});

export const BookingCardSkeleton = memo(function BookingCardSkeleton() {
  return (
    <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white animate-pulse">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="h-6 w-28 bg-slate-200 rounded-lg"></div>
          <div className="h-6 w-20 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="h-6 w-24 bg-slate-200 rounded-lg flex-shrink-0"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
          <div className="h-3 w-24 bg-slate-100 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 rounded"></div>
          <div className="h-3 w-20 bg-slate-100 rounded"></div>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-3">
        <div className="h-3 w-40 bg-slate-100 rounded"></div>
      </div>
    </div>
  );
});

export const BookingsSkeleton = memo(function BookingsSkeleton() {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 w-56 bg-slate-100 rounded animate-pulse"></div>
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
