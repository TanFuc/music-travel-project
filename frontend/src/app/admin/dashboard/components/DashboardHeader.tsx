'use client';

import { memo } from 'react';
import { Sparkles } from 'lucide-react';

export const DashboardHeader = memo(function DashboardHeader() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 text-base mt-2">Tổng quan hệ thống quản lý</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-white/50">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Cập nhật: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
});
