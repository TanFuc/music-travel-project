'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/components/common/Link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { Menu, ShoppingCart, User, LogOut, Search, ChevronDown, MapPin, X } from 'lucide-react';
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
  { href: '/tickets', label: 'Mua Vé' },
  { href: '/shows', label: 'Lịch Diễn' },
  { href: '/tours', label: 'Tour Du Lịch' },
  { href: '/register-singer', label: 'Đăng ký làm ca sĩ' },
  { href: '/about', label: 'Giới thiệu' },
  // { href: '/payment-demo', label: '💳 QR Demo' },
];

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationSlug = searchParams.get('location');

  const { isAuthenticated, user, logout, hasHydrated } = useAuthStore();
  // Optimize cart selector to only re-render when count changes
  const itemCount = useCartStore(useCallback((state) => state.getItemCount(), []));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  // Use React Query for locations
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      try {
        const response = await get<Location[]>('/locations');
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Failed to fetch locations:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Memoize selectedLocation to prevent recalculation on every render
  const selectedLocation = useMemo(
    () => locations.find(loc => loc.slug === locationSlug),
    [locations, locationSlug]
  );

  const filteredLocations = useMemo(() => {
    if (!locations || locations.length === 0) return [];
    if (!locationSearch.trim()) return locations;

    const normalize = (str: string) =>
      str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';

    const searchNormalized = normalize(locationSearch);

    return locations.filter(loc =>
      (loc.name && normalize(loc.name).includes(searchNormalized)) ||
      (loc.name && loc.name.toLowerCase().includes(locationSearch.toLowerCase()))
    );
  }, [locations, locationSearch]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Throttled scroll handler for better performance
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
  }, []);

  useThrottledScroll(handleScroll, 100);

  // Memoize event handlers to prevent unnecessary re-renders
  const toggleLocationDropdown = useCallback(() => {
    setIsLocationDropdownOpen(prev => !prev);
  }, []);

  const closeLocationDropdown = useCallback(() => {
    setIsLocationDropdownOpen(false);
    setLocationSearch('');
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
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
    <header
      className={cn(
        'glass-header py-3',
        isScrolled && 'header-scrolled'
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
                sizes="40px"
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
                onClick={toggleLocationDropdown}
                className={cn(
                  'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  'text-gray-600 hover:text-brand-600 hover:bg-brand-50',
                  locationSlug ? 'text-brand-600 bg-brand-50' : ''
                )}
              >
                <MapPin className="w-4 h-4" />
                {selectedLocation ? selectedLocation.name : 'Chi Nhánh'}
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform',
                    isLocationDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 py-2 bg-white rounded-xl shadow-xl z-50 border border-gray-100 overflow-hidden ring-1 ring-black/5">
                  {/* Search Header */}
                  <div className="px-3 pb-2 pt-1 border-b border-gray-50 mb-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm chi nhánh..."
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-brand-500 focus:bg-white transition-colors placeholder:text-gray-400"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Scrollable List */}
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    <Link
                      href={pathname?.startsWith('/tours') ? '/tours' : '/shows'}
                      onClick={closeLocationDropdown}
                      className={cn(
                        "flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:text-brand-600 hover:bg-brand-50 transition-colors",
                        !locationSlug && "bg-brand-50 text-brand-600 font-medium"
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
                            "flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:text-brand-600 hover:bg-brand-50 transition-colors",
                            locationSlug === location.slug && "bg-brand-50 text-brand-600 font-medium"
                          )}
                          onClick={closeLocationDropdown}
                        >
                          <span>{location.name}</span>
                          {location.showCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-600 font-medium">
                              {location.showCount}
                            </span>
                          )}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-sm text-gray-500 text-center flex flex-col items-center">
                        <MapPin className="h-8 w-8 text-gray-300 mb-2" />
                        <p>{isLoadingLocations ? 'Đang tải...' : 'Không tìm thấy kết quả'}</p>
                      </div>
                    )}
                  </div>
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
              onClick={openSearch}
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
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 md:w-24 bg-neutral-200 animate-pulse rounded-lg"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-1 md:gap-2">
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-gray-600 hover:text-brand-600 hover:bg-brand-50",
                      "h-10 w-10 px-0 md:h-9 md:w-auto md:px-3 md:gap-2"
                    )}
                  >
                    <User className="h-5 w-5 md:h-4 md:w-4" />
                    <span className="hidden md:inline text-sm font-medium">{user?.fullName}</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="hidden md:flex text-gray-600 hover:text-brand-600 hover:bg-brand-50"
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
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-card mt-4 border border-brand-100 overflow-hidden shadow-2xl animate-fadeIn">
            <nav className="flex flex-col p-2 gap-1">
              <p className="px-4 py-2 text-[10px] font-black text-brand-400 uppercase tracking-widest">Khám phá</p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-all active:scale-[0.98]',
                    pathname === link.href || pathname?.startsWith(link.href)
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                      : 'text-gray-700 hover:bg-brand-50 hover:text-brand-600'
                  )}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Location List */}
              <div className="mt-4 pt-4 border-t border-brand-50">
                <p className="px-4 py-2 text-[10px] font-black text-brand-400 uppercase tracking-widest">
                  Chi Nhánh
                </p>
                <div className="grid grid-cols-1 gap-1">
                  <Link
                    href={pathname?.startsWith('/tours') ? '/tours' : '/shows'}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center justify-between px-4 py-3.5 text-sm font-semibold rounded-xl transition-all active:scale-[0.98]",
                      !locationSlug
                        ? "bg-brand-50 text-brand-700 border border-brand-100"
                        : "text-gray-600 hover:bg-brand-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={cn("w-4 h-4", !locationSlug ? "text-brand-500" : "text-gray-400")} />
                      <span>Tất cả chi nhánh</span>
                    </div>
                  </Link>
                  {locations.map((location) => (
                    <Link
                      key={location.id}
                      href={`${pathname?.startsWith('/tours') ? '/tours' : '/shows'}?location=${location.slug}`}
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex items-center justify-between px-4 py-3.5 text-sm font-semibold rounded-xl transition-all active:scale-[0.98]",
                        locationSlug === location.slug
                          ? "bg-brand-50 text-brand-700 border border-brand-100"
                          : "text-gray-600 hover:bg-brand-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={cn("w-4 h-4", locationSlug === location.slug ? "text-brand-500" : "text-gray-400")} />
                        <span>{location.name}</span>
                      </div>
                      {location.showCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500 text-white font-black">
                          {location.showCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Auth */}
              {!hasHydrated ? (
                <div className="mt-4 p-4">
                  <div className="h-12 bg-neutral-100 animate-pulse rounded-2xl"></div>
                </div>
              ) : isAuthenticated ? (
                <div className="mt-4 pt-4 border-t border-brand-50 flex flex-col gap-2 p-2">
                  <Link href="/profile" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-gray-700 bg-brand-50 rounded-xl">
                    <User className="w-5 h-5 text-brand-500" />
                    <span>Tài khoản: {user?.fullName}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => { logout(); closeMobileMenu(); }}
                    className="flex items-center justify-start gap-3 px-4 py-3.5 w-full h-auto text-sm font-bold text-error-600 hover:bg-error-50 rounded-xl transition-all active:scale-[0.98]"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                  </Button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-brand-50 flex flex-col gap-3 p-2">
                  <Link href="/login" onClick={closeMobileMenu} className="w-full">
                    <Button variant="ghost" className="w-full py-6 text-sm font-bold text-gray-700 hover:bg-brand-50 rounded-2xl transition-all active:scale-[0.98]">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMobileMenu} className="w-full">
                    <Button className="w-full py-6 btn-primary rounded-2xl text-sm font-bold shadow-xl shadow-brand-600/20 active:scale-[0.98]">
                      Đăng ký ngay
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </header>
  );
}
