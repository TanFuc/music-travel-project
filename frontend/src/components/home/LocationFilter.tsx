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
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await get<Location[]>('/locations');
      return Array.isArray(response) ? response : [];
    },
    staleTime: 10 * 60 * 1000,
    enabled: !propLocations,
    initialData: propLocations || [],
  });
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 72);
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
        isSticky
          ? 'border-b border-white/20 bg-white/70 shadow-xl shadow-brand-500/5 backdrop-blur-xl'
          : ''
      )}
    >
      <div className="container mx-auto px-4">
        <div className="scrollbar-hide no-scrollbar flex items-center gap-4 overflow-x-auto pb-2">
          <div className="sticky left-0 z-10 flex shrink-0 items-center gap-3 bg-white pr-4 text-brand-700 sm:static sm:bg-transparent sm:pr-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 shadow-sm shadow-brand-500/10">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="hidden text-xs font-bold uppercase tracking-wide sm:block">
              Khám phá theo địa điểm:
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
              <span className="text-sm font-bold uppercase tracking-tighter text-gray-400">
                Đang tìm địa điểm...
              </span>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={() => onLocationChange?.(null)}
                className={cn(
                  'whitespace-nowrap rounded-full border px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all',
                  !selectedLocation
                    ? 'scale-105 transform border-brand-500 bg-brand-500 text-white shadow-md'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-brand-300 hover:text-brand-600'
                )}
              >
                Tất cả
              </button>

              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => onLocationChange?.(location.slug)}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-full border px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all',
                    selectedLocation === location.slug
                      ? 'scale-105 transform border-brand-500 bg-brand-500 text-white shadow-md'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-brand-300 hover:text-brand-600'
                  )}
                >
                  {location.name}
                  {location.showCount > 0 && (
                    <span
                      className={cn(
                        'flex h-5 min-w-[20px] items-center justify-center rounded-lg px-1.5 text-[10px] font-black',
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
