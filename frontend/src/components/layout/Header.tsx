'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingCart, User, LogOut, Search, ChevronDown, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { cn } from '@/lib/utils';

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
  const { isAuthenticated, user, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Fetch locations for dropdown
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/locations`)
      .then((res) => res.json())
      .then((data) => setLocations(Array.isArray(data) ? data : []))
      .catch(() => setLocations([]));
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
            <div className="relative w-10 h-10 overflow-hidden rounded-lg transition-transform group-hover:scale-105">
              <Image
                src="/logo.jpg"
                alt="Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="hidden sm:block font-display font-bold text-lg text-white">
              Music Travel
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
                    ? 'text-white bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
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
                  'text-white/70 hover:text-white hover:bg-white/5'
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
                        className="flex items-center justify-between px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5"
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
                    <div className="px-4 py-2 text-sm text-white/50">
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
              className="text-white/70 hover:text-white hover:bg-white/5"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/5"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent-500 border-0">
                  {itemCount}
                </Badge>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-white/70 hover:text-white hover:bg-white/5"
                  >
                    <User className="h-4 w-4" />
                    {user?.fullName}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-white/70 hover:text-white hover:bg-white/5"
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
                    className="text-white/70 hover:text-white hover:bg-white/5"
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
              className="md:hidden text-white/70 hover:text-white hover:bg-white/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 mt-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    pathname === link.href
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Location List */}
              <div className="mt-2 pt-2 border-t border-white/10">
                <p className="px-4 py-2 text-xs font-semibold text-white/50 uppercase">
                  Chi Nhánh
                </p>
                {locations.map((location) => (
                  <Link
                    key={location.id}
                    href={`/shows?location=${location.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg"
                  >
                    <span>{location.name}</span>
                    {location.showCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400">
                        {location.showCount}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {!isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-white/70">
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
    </header>
  );
}
