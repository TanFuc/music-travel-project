'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
interface Location {
  id: number;
  name: string;
  slug: string;
  showCount?: number;
}
interface LocationFilterClientProps {
  locations: Location[];
}
export const HOME_LOCATION_CHANGE_EVENT = 'home-location-change';
export function LocationFilterClient({ locations }: LocationFilterClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    searchParams.get('location')
  );
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const publishLocationChange = (location: string | null) => {
    window.dispatchEvent(
      new CustomEvent(HOME_LOCATION_CHANGE_EVENT, {
        detail: { location },
      })
    );
  };
  const handleLocationChange = (slug: string | null) => {
    if (selectedLocation === slug) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('location', slug);
    } else {
      params.delete('location');
    }
    setSelectedLocation(slug);
    const query = params.toString();
    window.history.pushState(null, '', query ? `${pathname}?${query}` : pathname);
    publishLocationChange(slug);
  };
  useEffect(() => {
    const handlePopState = () => {
      const location = new URLSearchParams(window.location.search).get('location');
      setSelectedLocation(location);
      publishLocationChange(location);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  useEffect(() => {
    const location = searchParams.get('location');
    setSelectedLocation(location);
    publishLocationChange(location);
  }, [searchParams]);
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
        <div className="scrollbar-hide flex items-center gap-6 overflow-x-auto pb-2">
          <div className="flex shrink-0 items-center gap-3 text-brand-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 shadow-sm shadow-brand-500/10">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="hidden text-xs font-bold uppercase tracking-wide sm:block">
              Khám phá theo địa điểm:
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLocationChange(null)}
              aria-pressed={!selectedLocation}
              className={cn(
                'whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                !selectedLocation
                  ? 'btn-primary'
                  : 'border border-gray-100 bg-white text-gray-400 shadow-sm hover:bg-brand-50 hover:text-brand-600'
              )}
            >
              Tất cả
            </button>

            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationChange(location.slug)}
                aria-pressed={selectedLocation === location.slug}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                  selectedLocation === location.slug
                    ? 'btn-primary scale-105 shadow-glow-lg'
                    : 'border border-gray-100 bg-white text-gray-400 shadow-sm hover:bg-brand-50 hover:text-brand-600'
                )}
              >
                {location.name}
                {location.showCount !== undefined && location.showCount > 0 && (
                  <span
                    className={cn(
                      'flex h-5 min-w-[20px] items-center justify-center rounded-lg px-1.5 text-[10px] font-black',
                      selectedLocation === location.slug
                        ? 'bg-white/20 text-white'
                        : 'bg-brand-50 text-brand-600'
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
