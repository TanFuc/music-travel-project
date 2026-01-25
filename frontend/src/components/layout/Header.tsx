'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/components/common/Link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingCart, User, LogOut, Search, ChevronDown, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { cn } from '@/lib/utils';
import { get } from '@/lib/api';
import { SearchModal } from '@/components/search';

interface Location {
  id: number;
  name: string;
  slug: string;
  showCount: number;
}

const navLinks = [
  { href: '/shows', label: 'Shows' },
  { href: '/tours', label: 'Tour Du Lịch' },
];

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout, hasHydrated } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Use React Query for locations - only fetch when dropdown opens (lazy load)
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await get<Location[]>('/locations');
      return Array.isArray(response) ? response : [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: isLocationDropdownOpen || mobileMenuOpen, // Only fetch when needed
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'glass-header transition-all duration-300',
        isScrolled ? 'py-2' : 'py-3'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white shadow-md border-2 border-brand-500/30 transition-all duration-300 group-hover:scale-105 group-hover:border-brand-500/50 group-hover:shadow-lg">
              <Image
                src="/logo.png"
                alt="Mãi Cho Hành Tinh Xanh"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="hidden sm:block font-display font-bold text-lg text-gray-900">
              Mãi Cho Hành Tinh Xanh
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname === link.href || pathname?.startsWith(link.href)
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50'
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Location Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className={cn(
                  'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  'text-gray-600 hover:text-brand-600 hover:bg-brand-50'
                )}
              >
                <MapPin className="w-4 h-4" />
                Chi Nhánh
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform',
                    isLocationDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 py-2 glass-card shadow-xl z-50">
                  {locations.length > 0 ? (
                    locations.map((location) => (
                      <Link
                        key={location.id}
                        href={`/shows?location=${location.slug}`}
                        className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:text-brand-600 hover:bg-brand-50"
                        onClick={() => setIsLocationDropdownOpen(false)}
                      >
                        <span>{location.name}</span>
                        {location.showCount > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400">
                            {location.showCount}
                          </span>
                        )}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      Đang tải...
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-brand-600 hover:bg-brand-50"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Link href="/cart" prefetch={false} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-brand-600 hover:bg-brand-50"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {isMounted && itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent-500 border-0">
                  {itemCount}
                </Badge>
              )}
            </Link>

            {/* Auth - Show skeleton while hydrating */}
            {!hasHydrated ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="h-9 w-24 bg-neutral-200 animate-pulse rounded-lg"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50"
                  >
                    <User className="h-4 w-4" />
                    {user?.fullName}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-gray-600 hover:text-brand-600 hover:bg-brand-50"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-brand-600 hover:bg-brand-50"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="btn-primary">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-600 hover:text-brand-600 hover:bg-brand-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 mt-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    pathname === link.href
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Location List */}
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Chi Nhánh
                </p>
                {locations.map((location) => (
                  <Link
                    key={location.id}
                    href={`/shows?location=${location.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                  >
                    <span>{location.name}</span>
                    {location.showCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-600">
                        {location.showCount}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Mobile Auth - Show skeleton while hydrating */}
              {!hasHydrated ? (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="h-10 bg-neutral-200 animate-pulse rounded-lg"></div>
                </div>
              ) : !isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-600">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full btn-primary">Đăng ký</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
