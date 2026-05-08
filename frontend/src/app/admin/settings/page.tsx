'use client';
import { Settings as SettingsIcon, Shield, Bell, Palette, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
export default function AdminSettingsPage() {
  const handleUnderDevelopment = () => {
    toast.info('Tính năng này đang được phát triển.');
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Cài đặt hệ thống</h1>
        <p className="mt-1 text-sm text-neutral-600 sm:text-base">
          Quản lý cấu hình cơ bản và giao diện của nền tảng Mãi Cho Hành Tinh Xanh
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-brand-600 sm:text-lg">
              <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              Cấu hình chung
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Thiết lập các thông tin cơ bản của website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Tên hệ thống', value: 'Mãi Cho Hành Tinh Xanh' },
                { label: 'Múi giờ', value: '(GMT+07:00) Bangkok, Hanoi, Jakarta' },
                { label: 'Ngôn ngữ', value: 'Tiếng Việt (VN)' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-2 border-b py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-tighter text-neutral-500">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUnderDevelopment}
                    className="text-brand-600 hover:bg-brand-50 hover:text-brand-700"
                  >
                    Chỉnh sửa
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-brand-600 sm:text-lg">
              <Palette className="h-5 w-5" />
              Giao diện & Branding
            </CardTitle>
            <CardDescription>Tùy chỉnh nhận diện thương hiệu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Logo Website', value: 'Default Logo' },
                { label: 'Màu sắc chủ đạo', value: 'Brand Green (#059669)' },
                { label: 'Favicon', value: 'Bizzmall Icon' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-2 border-b py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-tighter text-neutral-500">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUnderDevelopment}
                    className="text-brand-600 hover:bg-brand-50 hover:text-brand-700"
                  >
                    Thay đổi
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Bảo mật & Quyền hạn
            </CardTitle>
            <CardDescription>Cài đặt tài khoản admin và bảo mật</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b py-2">
                <span className="text-sm">Đổi mật khẩu Admin</span>
                <Button variant="outline" size="sm" onClick={handleUnderDevelopment}>
                  Cập nhật
                </Button>
              </div>
              <div className="flex items-center justify-between border-b py-2">
                <span className="text-sm">Xác thực 2 lớp (2FA)</span>
                <Button variant="outline" size="sm" disabled>
                  Đang phát triển
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Email & Thông báo
            </CardTitle>
            <CardDescription>Cấu hình máy chủ gửi mail (SMTP)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b py-2">
                <span className="text-sm">Cấu hình SMTP</span>
                <Button variant="outline" size="sm" onClick={handleUnderDevelopment}>
                  Thiết lập
                </Button>
              </div>
              <div className="flex items-center justify-between border-b py-2">
                <span className="text-sm">Email nhận booking</span>
                <Button variant="outline" size="sm" onClick={handleUnderDevelopment}>
                  Cấu hình
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-blue-50/20 md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Thông tin hệ thống</CardTitle>
              <CardDescription>Phiên bản phần mềm và tài liệu hướng dẫn</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
              <div>
                <p className="text-neutral-500">Phiên bản</p>
                <p className="font-bold text-neutral-900">v2.1.0-production</p>
              </div>
              <div>
                <p className="text-neutral-500">Môi trường</p>
                <p className="font-bold capitalize text-neutral-900">VPS Production</p>
              </div>
              <div>
                <p className="text-neutral-500">Dung lượng media</p>
                <p className="font-bold text-neutral-900">1.2 GB / 10 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
