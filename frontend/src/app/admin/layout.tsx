'use client';
import { useEffect, Suspense, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Link } from '@/components/common/Link';
import { useDebouncedResize } from '@/hooks/usePerformance';
import {
  LayoutDashboard,
  Users,
  Music,
  MapPin,
  Ticket,
  ShoppingBag,
  CreditCard,
  Tag,
  Image,
  Bell,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Theater,
  Mic,
  Package,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
function AdminPageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-neutral-200" />
      <div className="h-4 w-32 rounded bg-neutral-100" />
      <div className="mt-6 space-y-4 rounded-lg bg-white p-6">
        <div className="h-6 w-40 rounded bg-neutral-200" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded bg-neutral-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
const sidebarGroups = [
  {
    group: 'Tổng quan',
    items: [
      {
        title: 'Bảng điều khiển',
        description: 'Thống kê tổng quan',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    group: 'Dịch vụ & Sản phẩm',
    items: [
      {
        title: 'Show diễn',
        description: 'Quản lý đêm nhạc',
        href: '/admin/shows',
        icon: Music,
      },
      {
        title: 'Tour sinh thái',
        description: 'Quản lý lịch trình tour',
        href: '/admin/tours',
        icon: MapPin,
      },
      {
        title: 'Siêu Combo',
        description: 'Gói kết hợp Tour & Show',
        href: '/admin/combos',
        icon: Package,
      },
      {
        title: 'Gói ca sĩ',
        description: 'Dịch vụ thu âm ca sĩ',
        href: '/admin/singer-packages',
        icon: Tag,
      },
    ],
  },
  {
    group: 'Sân khấu & Vé',
    items: [
      {
        title: 'Quản lý sân khấu',
        description: 'Danh sách và sơ đồ ghế',
        href: '/admin/stages',
        icon: Theater,
      },
      {
        title: 'Sân khấu nổi bật',
        description: 'Hiển thị trên trang chủ',
        href: '/admin/home-stages',
        icon: Image,
      },
      {
        title: 'Kho vé',
        description: 'Theo dõi vé đã xuất',
        href: '/admin/tickets',
        icon: Ticket,
      },
    ],
  },
  {
    group: 'Kinh doanh',
    items: [
      {
        title: 'Đơn hàng',
        description: 'Quản lý đơn đặt chỗ',
        href: '/admin/bookings',
        icon: ShoppingBag,
      },
      {
        title: 'Thanh toán',
        description: 'Lịch sử giao dịch',
        href: '/admin/payments',
        icon: CreditCard,
      },
      {
        title: 'Mã giảm giá',
        description: 'Chương trình khuyến mãi',
        href: '/admin/vouchers',
        icon: Tag,
      },
    ],
  },
  {
    group: 'Tài khoản',
    items: [
      {
        title: 'Người dùng',
        description: 'Quản lý khách hàng',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'Duyệt ca sĩ',
        description: 'Yêu cầu đăng ký ca sĩ',
        href: '/admin/singer-registrations',
        icon: Mic,
      },
    ],
  },
  {
    group: 'Hệ thống',
    items: [
      {
        title: 'Media',
        description: 'Hình ảnh, video',
        href: '/admin/media',
        icon: Image,
      },
      {
        title: 'Banner quảng cáo',
        description: 'Banner trên website',
        href: '/admin/banners',
        icon: Image,
      },
      {
        title: 'Thông báo',
        description: 'Hệ thống thông báo',
        href: '/admin/notifications',
        icon: Bell,
      },
      {
        title: 'Cổng thanh toán',
        description: 'Cấu hình thanh toán',
        href: '/admin/payment-methods',
        icon: CreditCard,
      },
      {
        title: 'Cài đặt',
        description: 'Cấu hình chung',
        href: '/admin/settings',
        icon: Settings,
      },
    ],
  },
];
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, hasHydrated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleResize = useCallback(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, []);
  useEffect(() => {
    handleResize();
  }, [handleResize]);
  useDebouncedResize(handleResize, 150);
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);
  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
      router.push('/');
    }
  }, [isAuthenticated, user, router, hasHydrated]);
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-brand-600"></div>
          <p className="text-neutral-600">Đang tải...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
    return null;
  }
  return (
    <div className="min-h-screen bg-neutral-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen border-r bg-white transition-all duration-300',
          'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          sidebarOpen ? 'lg:w-64' : 'lg:w-20'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="relative flex h-16 items-center border-b px-4">
            <div
              className={cn(
                'flex items-center overflow-hidden transition-all duration-300 ease-in-out',
                sidebarOpen ? 'max-w-full opacity-100' : 'max-w-0 opacity-0'
              )}
            >
              <div className="flex-shrink-0">
                <Logo size="sm" />
              </div>
            </div>

            <div
              className={cn(
                'absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out',
                sidebarOpen
                  ? 'invisible opacity-0 lg:invisible lg:opacity-0'
                  : 'visible hidden opacity-100 lg:block'
              )}
            >
              <Logo size="sm" showText={false} />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                'ml-auto hidden flex-shrink-0 lg:flex',
                !sidebarOpen && 'absolute right-4'
              )}
            >
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform duration-300',
                  !sidebarOpen && 'rotate-180'
                )}
              />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="ml-auto flex-shrink-0 lg:hidden"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-6">
              {sidebarGroups.map((group, groupIdx) => (
                <div key={groupIdx}>
                  <h3
                    className={cn(
                      'mb-2 px-3 text-xs font-bold uppercase tracking-wider text-neutral-400 transition-all duration-300',
                      !sidebarOpen && 'lg:hidden'
                    )}
                  >
                    {group.group}
                  </h3>
                  {!sidebarOpen && groupIdx > 0 && (
                    <div className="mx-4 mb-4 mt-4 hidden h-px bg-neutral-200 lg:block" />
                  )}
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const isActive =
                        pathname === item.href || pathname.startsWith(item.href + '/');
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                              isActive
                                ? 'bg-brand-50 text-brand-600'
                                : 'text-neutral-600 hover:bg-neutral-100',
                              !sidebarOpen && 'lg:justify-center lg:px-2'
                            )}
                            title={!sidebarOpen ? `${item.title} - ${item.description}` : undefined}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <div
                              className={cn(
                                'flex flex-col overflow-hidden transition-all duration-300',
                                !sidebarOpen ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'
                              )}
                            >
                              <span className="truncate text-sm font-medium leading-none">
                                {item.title}
                              </span>
                              {sidebarOpen && (
                                <span className="mt-1 truncate text-[11px] leading-none text-neutral-400 group-hover:text-neutral-500">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          <div className="border-t p-4">
            <div className={cn('flex items-center gap-3', !sidebarOpen && 'lg:justify-center')}>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100">
                <Users className="h-5 w-5 text-brand-600" />
              </div>
              <div
                className={cn(
                  'min-w-0 flex-1 transition-all duration-300',
                  !sidebarOpen && 'lg:w-0 lg:overflow-hidden lg:opacity-0'
                )}
              >
                <p className="truncate text-sm font-semibold">{user?.fullName}</p>
                <p className="text-xs text-neutral-500">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className={cn(
                'mt-3 w-full text-neutral-600',
                !sidebarOpen && 'lg:justify-center lg:px-0'
              )}
              onClick={handleLogout}
              title={!sidebarOpen ? 'Đăng xuất' : undefined}
            >
              <LogOut className="h-4 w-4" />
              <span
                className={cn(
                  'ml-2 transition-all duration-300',
                  !sidebarOpen && 'lg:w-0 lg:overflow-hidden lg:opacity-0'
                )}
              >
                Đăng xuất
              </span>
            </Button>
          </div>
        </div>
      </aside>

      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {sidebarGroups.flatMap((group) => group.items).find((item) => item.href === pathname)
                ?.title || 'Admin'}
            </h2>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <Suspense fallback={<AdminPageSkeleton />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
