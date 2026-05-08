'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/components/common/Link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Menu,
  ShoppingCart,
  User,
  LogOut,
  Search,
  ChevronDown,
  ChevronRight,
  MapPin,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { cn } from '@/lib/utils';
import { get } from '@/lib/api';
import { SearchModal } from '@/components/search';
import { useThrottledScroll } from '@/hooks/usePerformance';
interface Location {
  id: number;
  name: string;
  slug: string;
  showCount: number;
}
const navLinks = [
  { href: '/about', label: 'Giới thiệu' },
  {
    label: 'Hành Trình',
    hasSubmenu: true,
    submenu: [
      { href: '/shows', label: 'Đêm nhạc sinh thái' },
      { href: '/tours', label: 'Tour trải nghiệm' },
      { href: '/combo', label: 'Combo Show & Tour' },
    ],
  },
  { href: '/partners', label: 'Đối tác' },
];
export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationSlug = searchParams.get('location');
  const { isAuthenticated, user, logout, hasHydrated } = useAuthStore();
  const itemCount = useCartStore(useCallback((state) => state.getItemCount(), []));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      try {
        const response = await get<Location[]>('/locations');
        return Array.isArray(response) ? response : [];
      } catch {
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
  });
  const selectedLocation = useMemo(
    () => locations.find((loc) => loc.slug === locationSlug),
    [locations, locationSlug]
  );
  const filteredLocations = useMemo(() => {
    if (!locations || locations.length === 0) return [];
    if (!locationSearch.trim()) return locations;
    const normalize = (str: string) =>
      str
        ? str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
        : '';
    const searchNormalized = normalize(locationSearch);
    return locations.filter(
      (loc) =>
        (loc.name && normalize(loc.name).includes(searchNormalized)) ||
        (loc.name && loc.name.toLowerCase().includes(locationSearch.toLowerCase()))
    );
  }, [locations, locationSearch]);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
  }, []);
  useThrottledScroll(handleScroll, 100);
  const toggleLocationDropdown = useCallback(() => {
    setIsLocationDropdownOpen((prev) => !prev);
  }, []);
  const closeLocationDropdown = useCallback(() => {
    setIsLocationDropdownOpen(false);
    setLocationSearch('');
  }, []);
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);
  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);
  return (
    <header className={cn('glass-header py-3', isScrolled && 'header-scrolled')}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-brand-500/30 bg-white shadow-md transition-all duration-300 group-hover:scale-105 group-hover:border-brand-500/50 group-hover:shadow-lg">
              <Image
                src="/logo.png"
                alt="Mãi Cho Hành Tinh Xanh"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            <span className="hidden font-display text-lg font-bold text-gray-900 sm:block">
              Mãi Cho Hành Tinh Xanh
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              if (link.hasSubmenu) {
                const isActive = link.submenu?.some(
                  (sub) => pathname === sub.href || pathname?.startsWith(sub.href)
                );
                return (
                  <div key={link.label} className="group relative">
                    <button
                      className={cn(
                        'flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-gray-600 hover:bg-brand-50 hover:text-brand-600'
                      )}
                    >
                      {link.label}
                      <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                    </button>
                    <div className="absolute left-0 top-full z-50 hidden w-48 pt-2 group-hover:block">
                      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-xl ring-1 ring-black/5">
                        {link.submenu?.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              'block px-4 py-2 text-sm transition-colors',
                              pathname === sub.href || pathname?.startsWith(sub.href)
                                ? 'bg-brand-50 font-medium text-brand-600'
                                : 'text-gray-600 hover:bg-brand-50 hover:text-brand-600'
                            )}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    pathname === link.href || pathname?.startsWith(link.href!)
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:bg-brand-50 hover:text-brand-600'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="relative">
              <button
                onClick={toggleLocationDropdown}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  'text-gray-600 hover:bg-brand-50 hover:text-brand-600',
                  locationSlug ? 'bg-brand-50 text-brand-600' : ''
                )}
              >
                <MapPin className="h-4 w-4" />
                {selectedLocation ? selectedLocation.name : 'Chi Nhánh'}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isLocationDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-xl ring-1 ring-black/5">
                  <div className="mb-1 border-b border-gray-50 px-3 pb-2 pt-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm chi nhánh..."
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div className="custom-scrollbar max-h-[300px] overflow-y-auto">
                    <Link
                      href={pathname?.startsWith('/tours') ? '/tours' : '/shows'}
                      onClick={closeLocationDropdown}
                      className={cn(
                        'flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-600',
                        !locationSlug && 'bg-brand-50 font-medium text-brand-600'
                      )}
                    >
                      <span>Tất cả chi nhánh</span>
                    </Link>
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((location) => (
                        <Link
                          key={location.id}
                          href={`${pathname?.startsWith('/tours') ? '/tours' : '/shows'}?location=${location.slug}`}
                          className={cn(
                            'flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-600',
                            locationSlug === location.slug &&
                              'bg-brand-50 font-medium text-brand-600'
                          )}
                          onClick={closeLocationDropdown}
                        >
                          <span>{location.name}</span>
                          {location.showCount > 0 && (
                            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-600">
                              {location.showCount}
                            </span>
                          )}
                        </Link>
                      ))
                    ) : (
                      <div className="flex flex-col items-center px-4 py-8 text-center text-sm text-gray-500">
                        <MapPin className="mb-2 h-8 w-8 text-gray-300" />
                        <p>{isLoadingLocations ? 'Đang tải...' : 'Không tìm thấy kết quả'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-brand-50 hover:text-brand-600"
              onClick={openSearch}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/cart" prefetch={false} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-brand-50 hover:text-brand-600"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {isMounted && itemCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-0 bg-accent-500 p-0 text-xs">
                  {itemCount}
                </Badge>
              )}
            </Link>

            {!hasHydrated ? (
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-neutral-200 md:w-24"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-1 md:gap-2">
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    className={cn(
                      'text-gray-600 hover:bg-brand-50 hover:text-brand-600',
                      'h-10 w-10 px-0 md:h-9 md:w-auto md:gap-2 md:px-3'
                    )}
                  >
                    <User className="h-5 w-5 md:h-4 md:w-4" />
                    <span className="hidden text-sm font-medium md:inline">{user?.fullName}</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="hidden text-gray-600 hover:bg-brand-50 hover:text-brand-600 md:flex"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:bg-brand-50 hover:text-brand-600"
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

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:bg-brand-50 hover:text-brand-600 md:hidden"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="glass-card animate-fadeIn mt-4 overflow-hidden border border-brand-100 shadow-2xl md:hidden">
            <nav className="flex flex-col gap-1 p-2">
              <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-400">
                Khám phá
              </p>
              {navLinks.map((link) => {
                if (link.hasSubmenu) {
                  return (
                    <div key={link.label} className="mb-2 border-b border-brand-50 pb-2">
                      <div className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                        {link.label}
                      </div>
                      <div className="mt-1 flex flex-col gap-1">
                        {link.submenu?.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              'flex items-center gap-3 rounded-xl py-3 pl-6 pr-4 text-sm font-semibold transition-all active:scale-[0.98]',
                              pathname === sub.href || pathname?.startsWith(sub.href)
                                ? 'bg-brand-100 text-brand-700 shadow-sm'
                                : 'text-gray-600 hover:bg-brand-50 hover:text-brand-600'
                            )}
                            onClick={closeMobileMenu}
                          >
                            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href!}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all active:scale-[0.98]',
                      pathname === link.href || pathname?.startsWith(link.href!)
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                        : 'text-gray-700 hover:bg-brand-50 hover:text-brand-600'
                    )}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="mt-4 border-t border-brand-50 pt-4">
                <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-400">
                  Chi Nhánh
                </p>
                <div className="grid grid-cols-1 gap-1">
                  <Link
                    href={pathname?.startsWith('/tours') ? '/tours' : '/shows'}
                    onClick={closeMobileMenu}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition-all active:scale-[0.98]',
                      !locationSlug
                        ? 'border border-brand-100 bg-brand-50 text-brand-700'
                        : 'text-gray-600 hover:bg-brand-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin
                        className={cn(
                          'h-4 w-4',
                          !locationSlug ? 'text-brand-500' : 'text-gray-400'
                        )}
                      />
                      <span>Tất cả chi nhánh</span>
                    </div>
                  </Link>
                  {locations.map((location) => (
                    <Link
                      key={location.id}
                      href={`${pathname?.startsWith('/tours') ? '/tours' : '/shows'}?location=${location.slug}`}
                      onClick={closeMobileMenu}
                      className={cn(
                        'flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition-all active:scale-[0.98]',
                        locationSlug === location.slug
                          ? 'border border-brand-100 bg-brand-50 text-brand-700'
                          : 'text-gray-600 hover:bg-brand-50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin
                          className={cn(
                            'h-4 w-4',
                            locationSlug === location.slug ? 'text-brand-500' : 'text-gray-400'
                          )}
                        />
                        <span>{location.name}</span>
                      </div>
                      {location.showCount > 0 && (
                        <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-black text-white">
                          {location.showCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {!hasHydrated ? (
                <div className="mt-4 p-4">
                  <div className="h-12 animate-pulse rounded-2xl bg-neutral-100"></div>
                </div>
              ) : isAuthenticated ? (
                <div className="mt-4 flex flex-col gap-2 border-t border-brand-50 p-2 pt-4">
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3.5 text-sm font-bold text-gray-700"
                  >
                    <User className="h-5 w-5 text-brand-500" />
                    <span>Tài khoản: {user?.fullName}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="hover:bg-error-50 flex h-auto w-full items-center justify-start gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-error-600 transition-all active:scale-[0.98]"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Đăng xuất</span>
                  </Button>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3 border-t border-brand-50 p-2 pt-4">
                  <Link href="/login" onClick={closeMobileMenu} className="w-full">
                    <Button
                      variant="ghost"
                      className="w-full rounded-2xl py-6 text-sm font-bold text-gray-700 transition-all hover:bg-brand-50 active:scale-[0.98]"
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMobileMenu} className="w-full">
                    <Button className="btn-primary w-full rounded-2xl py-6 text-sm font-bold shadow-xl shadow-brand-600/20 active:scale-[0.98]">
                      Đăng ký ngay
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </header>
  );
}
