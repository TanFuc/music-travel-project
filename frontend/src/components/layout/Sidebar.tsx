'use client';

import { Link } from '@/components/common/Link';
import { usePathname } from 'next/navigation';
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
  Building,
  Settings,
  LogOut,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  user?: {
    fullName: string;
    role: string;
  } | null;
  onLogout: () => void;
}

const sidebarItems: SidebarItem[] = [
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
    title: 'Sự kiện',
    href: '/admin/shows',
    icon: Music,
  },
  {
    title: 'Tour',
    href: '/admin/tours',
    icon: MapPin,
  },
  {
    title: 'Vé',
    href: '/admin/tickets',
    icon: Ticket,
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
    title: 'Chi nhánh',
    href: '/admin/branches',
    icon: Building,
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

export function Sidebar({ isOpen, onToggle, user, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen bg-white border-r transition-all duration-300',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {isOpen ? <Logo size="sm" /> : <Logo size="sm" showText={false} />}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hidden lg:flex"
          >
            <ChevronRight
              className={cn('h-4 w-4 transition-transform', !isOpen && 'rotate-180')}
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
                    {isOpen && <span className="text-sm font-medium">{item.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="border-t p-4">
          <div
            className={cn('flex items-center gap-3', !isOpen && 'justify-center')}
          >
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-brand-600" />
            </div>
            {isOpen && user && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.fullName}</p>
                <p className="text-xs text-neutral-500">{user.role}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            className={cn('w-full mt-3 text-neutral-600', !isOpen && 'px-0')}
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            {isOpen && <span className="ml-2">Đăng xuất</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}

export { sidebarItems };
