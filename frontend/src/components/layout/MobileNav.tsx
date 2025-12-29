'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Music, MapPin, User, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/', icon: Home, label: 'Trang chủ' },
  { href: '/shows', icon: Music, label: 'Sự kiện' },
  { href: '/tours', icon: MapPin, label: 'Tour' },
  { href: '/cart', icon: ShoppingCart, label: 'Giỏ hàng' },
  { href: '/profile', icon: User, label: 'Tài khoản' },
];

export function MobileNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t lg:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isCart = item.href === '/cart';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 relative',
                isActive ? 'text-brand-500' : 'text-neutral-500'
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {isCart && itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                    {itemCount}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
