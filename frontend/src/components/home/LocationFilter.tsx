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
        'sticky top-[72px] z-40 py-3 transition-all duration-500',
        isSticky ? 'bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-xl shadow-brand-500/5' : ''
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2 no-scrollbar">
          <div className="flex items-center gap-3 text-brand-700 shrink-0 sticky left-0 z-10 bg-white pr-4 sm:pr-0 sm:static sm:bg-transparent">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-sm shadow-brand-500/10">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide hidden sm:block">Khám phá theo địa điểm:</span>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
              <span className="text-gray-400 text-sm font-bold uppercase tracking-tighter">Đang tìm địa điểm...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onLocationChange?.(null)}
                className={cn(
                  'px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border',
                  !selectedLocation
                    ? 'bg-brand-500 text-white border-brand-500 shadow-md transform scale-105'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                )}
              >
                Tất cả
              </button>

              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => onLocationChange?.(location.slug)}
                  className={cn(
                    'flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border',
                    selectedLocation === location.slug
                      ? 'bg-brand-500 text-white border-brand-500 shadow-md transform scale-105'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                  )}
                >
                  {location.name}
                  {location.showCount > 0 && (
                    <span
                      className={cn(
                        'min-w-[20px] h-5 flex items-center justify-center text-[10px] font-black rounded-lg px-1.5',
                        selectedLocation === location.slug
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-brand-100 group-hover:text-brand-600'
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
