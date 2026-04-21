'use client';
import { BannerForm } from '@/components/admin/BannerForm';
export default function CreateBannerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Thêm Banner Mới</h1>
      <BannerForm />
    </div>
  );
}
