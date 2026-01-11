'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const sidebarItems = [
  {
    title: 'Tong quan',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Nguoi dung',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Su kien',
    href: '/admin/shows',
    icon: Music,
  },
  {
    title: 'Tour',
    href: '/admin/tours',
    icon: MapPin,
  },
  {
    title: 'Ve',
    href: '/admin/tickets',
    icon: Ticket,
  },
  {
    title: 'Don hang',
    href: '/admin/bookings',
    icon: ShoppingBag,
  },
  {
    title: 'Thanh toan',
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
    title: 'Thong bao',
    href: '/admin/notifications',
    icon: Bell,
  },
  {
    title: 'Cai dat',
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen bg-white border-r transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            {sidebarOpen ? (
              <Logo size="sm" />
            ) : (
              <Logo size="sm" showText={false} />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex"
            >
              <ChevronRight
                className={cn('h-4 w-4 transition-transform', !sidebarOpen && 'rotate-180')}
              />
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
                          : 'text-neutral-600 hover:bg-neutral-100'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {sidebarOpen && <span className="text-sm font-medium">{item.title}</span>}
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
                !sidebarOpen && 'justify-center'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-brand-600" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                  <p className="text-xs text-neutral-500">{user?.role}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              className={cn(
                'w-full mt-3 text-neutral-600',
                !sidebarOpen && 'px-0'
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {sidebarOpen && <span className="ml-2">Dang xuat</span>}
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
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
