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
  Tags,
  Mic,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';

// Admin page loading skeleton
function AdminPageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-neutral-200 rounded" />
      <div className="h-4 w-32 bg-neutral-100 rounded" />
      <div className="mt-6 bg-white rounded-lg p-6 space-y-4">
        <div className="h-6 w-40 bg-neutral-200 rounded" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-neutral-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

const sidebarItems = [
  {
    title: 'Tổng quan',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Người dùng',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Show diễn',
    href: '/admin/shows',
    icon: Music,
  },
  {
    title: 'Đăng ký ca sĩ',
    href: '/admin/singer-registrations',
    icon: Mic,
  },
  {
    title: 'Gói ca sĩ',
    href: '/admin/singer-packages',
    icon: Tag,
  },
  {
    title: 'Tour',
    href: '/admin/tours',
    icon: MapPin,
  },
  {
    title: 'Sân khấu',
    href: '/admin/stages',
    icon: Theater,
  },
  {
    title: 'Sân khấu (Home)',
    href: '/admin/home-stages',
    icon: Image,
  },
  {
    title: 'Vé',
    href: '/admin/tickets',
    icon: Ticket,
  },
  {
    title: 'Loại vé bán',
    href: '/admin/ticket-tiers',
    icon: Tags,
  },
  {
    title: 'Đơn hàng',
    href: '/admin/bookings',
    icon: ShoppingBag,
  },
  {
    title: 'Thanh toán',
    href: '/admin/payments',
    icon: CreditCard,
  },
  {
    title: 'Voucher',
    href: '/admin/vouchers',
    icon: Tag,
  },
  {
    title: 'Media',
    href: '/admin/media',
    icon: Image,
  },
  {
    title: 'Banner',
    href: '/admin/banners',
    icon: Image,
  },

  {
    title: 'Thông báo',
    href: '/admin/notifications',
    icon: Bell,
  },
  {
    title: 'Cài đặt',
    href: '/admin/settings',
    icon: Settings,
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

  // Auto-open sidebar on desktop, close on mobile
  const handleResize = useCallback(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, []);

  // Set initial state
  useEffect(() => {
    handleResize();
  }, [handleResize]);

  // Debounced resize listener for better performance
  useDebouncedResize(handleResize, 150);

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    // Wait for hydration before checking auth
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

  // Show loading while hydrating
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not admin/staff
  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-white border-r transition-all duration-300',
          // Mobile: always w-64 but slide in/out
          'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: reset translate, control width
          'lg:translate-x-0',
          sidebarOpen ? 'lg:w-64' : 'lg:w-20'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="relative flex items-center h-16 px-4 border-b">
            {/* Full logo with text - visible when sidebar is open */}
            <div className={cn(
              "flex items-center overflow-hidden transition-all duration-300 ease-in-out",
              sidebarOpen ? "max-w-full opacity-100" : "max-w-0 opacity-0"
            )}>
              <div className="flex-shrink-0">
                <Logo size="sm" />
              </div>
            </div>
            
            {/* Icon only logo - visible when sidebar is collapsed on desktop */}
            <div className={cn(
              "absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out",
              sidebarOpen ? "opacity-0 invisible lg:opacity-0 lg:invisible" : "opacity-100 visible hidden lg:block"
            )}>
              <Logo size="sm" showText={false} />
            </div>

            {/* Toggle Button - Desktop */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                "hidden lg:flex flex-shrink-0 ml-auto",
                !sidebarOpen && "absolute right-4"
              )}
            >
              <ChevronRight
                className={cn('h-4 w-4 transition-transform duration-300', !sidebarOpen && 'rotate-180')}
              />
            </Button>

            {/* Close Button - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto flex-shrink-0"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                        isActive
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-neutral-600 hover:bg-neutral-100',
                        !sidebarOpen && 'lg:justify-center lg:px-2'
                      )}
                      title={!sidebarOpen ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className={cn("text-sm font-medium transition-all duration-300",
                        !sidebarOpen ? "lg:w-0 lg:opacity-0 lg:overflow-hidden" : "lg:w-auto lg:opacity-100"
                      )}>
                        {item.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t p-4">
            <div
              className={cn(
                'flex items-center gap-3',
                !sidebarOpen && 'lg:justify-center'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-brand-600" />
              </div>
              <div className={cn("flex-1 min-w-0 transition-all duration-300", !sidebarOpen && "lg:w-0 lg:opacity-0 lg:overflow-hidden")}>
                <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                <p className="text-xs text-neutral-500">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className={cn(
                'w-full mt-3 text-neutral-600',
                !sidebarOpen && 'lg:px-0 lg:justify-center'
              )}
              onClick={handleLogout}
              title={!sidebarOpen ? "Đăng xuất" : undefined}
            >
              <LogOut className="h-4 w-4" />
              <span className={cn("ml-2 transition-all duration-300", !sidebarOpen && "lg:w-0 lg:opacity-0 lg:overflow-hidden")}>
                Đăng xuất
              </span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b h-16 flex items-center px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-4"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {sidebarItems.find((item) => item.href === pathname)?.title || 'Admin'}
            </h2>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <Suspense fallback={<AdminPageSkeleton />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
