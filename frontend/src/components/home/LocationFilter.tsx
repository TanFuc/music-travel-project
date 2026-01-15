'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { get } from '@/lib/api';

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

export function LocationFilter({
  locations: propLocations,
  selectedLocation,
  onLocationChange,
}: LocationFilterProps) {
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use React Query instead of manual fetch
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await get<Location[]>('/locations');
      return Array.isArray(response) ? response : [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: !propLocations, // Only fetch if no props provided
    initialData: propLocations || [],
  });

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
        isSticky ? 'bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm' : ''
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
          <div className="flex items-center gap-2 text-gray-600 shrink-0">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">Chọn chi nhánh:</span>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
              <span className="text-gray-500 text-sm">Đang tải...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLocationChange?.(null)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                  !selectedLocation
                    ? 'bg-brand-500 text-white shadow-glow'
                    : 'bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600'
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
                      : 'bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600'
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
          )}
        </div>
      </div>
    </div>
  );
}
