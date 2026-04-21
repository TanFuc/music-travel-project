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
  Phone,
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
    title: 'Show diễn',
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
  {
    title: 'Kênh liên hệ',
    href: '/admin/contact-channels',
    icon: Phone,
  },
];
export function Sidebar({ isOpen, onToggle, user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-white transition-all duration-300',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          {isOpen ? <Logo size="sm" /> : <Logo size="sm" showText={false} />}
          <Button variant="ghost" size="icon" onClick={onToggle} className="hidden lg:flex">
            <ChevronRight className={cn('h-4 w-4 transition-transform', !isOpen && 'rotate-180')} />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
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

        <div className="border-t p-4">
          <div className={cn('flex items-center gap-3', !isOpen && 'justify-center')}>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100">
              <Users className="h-5 w-5 text-brand-600" />
            </div>
            {isOpen && user && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user.fullName}</p>
                <p className="text-xs text-neutral-500">{user.role}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            className={cn('mt-3 w-full text-neutral-600', !isOpen && 'px-0')}
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
