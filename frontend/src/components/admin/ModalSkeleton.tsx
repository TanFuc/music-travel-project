'use client';
import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
export const ModalSkeleton = memo(function ModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-slate-200"></div>
            <div className="h-4 w-64 rounded bg-slate-100"></div>
          </div>
          <div className="h-8 w-8 rounded bg-slate-200"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 w-full rounded bg-slate-200"></div>
          <div className="h-24 w-full rounded bg-slate-200"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 w-full rounded bg-slate-200"></div>
            <div className="h-10 w-full rounded bg-slate-200"></div>
          </div>
          <div className="flex gap-2 pt-4">
            <div className="h-10 flex-1 rounded bg-slate-200"></div>
            <div className="h-10 flex-1 rounded bg-slate-200"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
export const EditorSkeleton = memo(function EditorSkeleton() {
  return (
    <div className="flex h-[600px] w-full animate-pulse items-center justify-center rounded-lg bg-slate-100">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-slate-200"></div>
        <div className="mx-auto h-4 w-32 rounded bg-slate-200"></div>
      </div>
    </div>
  );
});
export const TableSkeleton = memo(function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded bg-slate-200"></div>
        <div className="h-10 w-32 rounded bg-slate-200"></div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="bg-slate-100 p-4">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 rounded bg-slate-200"></div>
            ))}
          </div>
        </div>
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-5 gap-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 rounded bg-slate-100"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
