'use client';
import { memo } from 'react';
import { Sparkles } from 'lucide-react';
export const DashboardHeader = memo(function DashboardHeader() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 opacity-50 blur-3xl"></div>
      </div>

      <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Dashboard</h1>
          <p className="mt-2 text-base text-slate-600">Tổng quan hệ thống quản lý</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-md backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>
            Cập nhật:{' '}
            {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
});
