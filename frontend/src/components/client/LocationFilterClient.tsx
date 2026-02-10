'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { MapPin, Loader2 } from 'lucide-react';
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

export function LocationFilterClient({ locations }: LocationFilterClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLocation = searchParams.get('location');

  const handleLocationChange = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (slug) {
      params.set('location', slug);
    } else {
      params.delete('location');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

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
        isSticky ? 'bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-xl shadow-brand-500/5' : ''
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide pb-2">
          <div className="flex items-center gap-3 text-brand-700 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-sm shadow-brand-500/10">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide hidden sm:block">
              Khám phá theo địa điểm:
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLocationChange(null)}
              disabled={isPending}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap',
                !currentLocation
                  ? 'btn-primary'
                  : 'bg-white text-gray-400 hover:bg-brand-50 hover:text-brand-600 border border-gray-100 shadow-sm',
                isPending && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isPending && !currentLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Tất cả'
              )}
            </button>

            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationChange(location.slug)}
                disabled={isPending}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap',
                  currentLocation === location.slug
                    ? 'btn-primary shadow-glow-lg scale-105'
                    : 'bg-white text-gray-400 hover:bg-brand-50 hover:text-brand-600 border border-gray-100 shadow-sm',
                  isPending && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isPending && currentLocation === location.slug ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {location.name}
                    {location.showCount !== undefined && location.showCount > 0 && (
                      <span
                        className={cn(
                          'min-w-[20px] h-5 flex items-center justify-center text-[10px] font-black rounded-lg px-1.5',
                          currentLocation === location.slug
                            ? 'bg-white/20 text-white'
                            : 'bg-brand-50 text-brand-600'
                        )}
                      >
                        {location.showCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
