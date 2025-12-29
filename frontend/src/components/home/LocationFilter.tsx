'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Location {
  id: number;
  name: string;
  slug: string;
  showCount: number;
}

interface LocationFilterProps {
  locations?: Location[];
  selectedLocation?: string;
  onLocationChange?: (slug: string | null) => void;
}

// Mock data
const mockLocations: Location[] = [
  { id: 1, name: 'Đà Lạt', slug: 'da-lat', showCount: 8 },
  { id: 2, name: 'Hà Nội', slug: 'ha-noi', showCount: 5 },
  { id: 3, name: 'Sài Gòn', slug: 'sai-gon', showCount: 12 },
  { id: 4, name: 'Đà Nẵng', slug: 'da-nang', showCount: 3 },
  { id: 5, name: 'Nha Trang', slug: 'nha-trang', showCount: 2 },
];

export function LocationFilter({
  locations = mockLocations,
  selectedLocation,
  onLocationChange,
}: LocationFilterProps) {
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 72); // Header height
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'sticky top-[72px] z-40 py-4 transition-all duration-300',
        isSticky ? 'bg-dark/95 backdrop-blur-lg border-b border-white/10' : ''
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
          <div className="flex items-center gap-2 text-white/60 shrink-0">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">Chọn chi nhánh:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onLocationChange?.(null)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                !selectedLocation
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              Tất cả
            </button>

            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => onLocationChange?.(location.slug)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                  selectedLocation === location.slug
                    ? 'bg-brand-500 text-white shadow-glow'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                {location.name}
                {location.showCount > 0 && (
                  <span
                    className={cn(
                      'w-5 h-5 flex items-center justify-center text-xs rounded-full',
                      selectedLocation === location.slug
                        ? 'bg-white/20'
                        : 'bg-brand-500/20 text-brand-400'
                    )}
                  >
                    {location.showCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
