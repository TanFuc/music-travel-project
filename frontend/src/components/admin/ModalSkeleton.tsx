'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const ModalSkeleton = memo(function ModalSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded"></div>
            <div className="h-4 w-64 bg-slate-100 rounded"></div>
          </div>
          <div className="h-8 w-8 bg-slate-200 rounded"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 w-full bg-slate-200 rounded"></div>
          <div className="h-24 w-full bg-slate-200 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 w-full bg-slate-200 rounded"></div>
            <div className="h-10 w-full bg-slate-200 rounded"></div>
          </div>
          <div className="flex gap-2 pt-4">
            <div className="h-10 flex-1 bg-slate-200 rounded"></div>
            <div className="h-10 flex-1 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export const EditorSkeleton = memo(function EditorSkeleton() {
  return (
    <div className="w-full h-[600px] bg-slate-100 rounded-lg flex items-center justify-center animate-pulse">
      <div className="text-center">
        <div className="h-12 w-12 rounded-full bg-slate-200 mx-auto mb-4"></div>
        <div className="h-4 w-32 bg-slate-200 rounded mx-auto"></div>
      </div>
    </div>
  );
});

export const TableSkeleton = memo(function TableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-200 rounded"></div>
        <div className="h-10 w-32 bg-slate-200 rounded"></div>
      </div>
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-100 p-4">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-5 gap-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-slate-100 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
