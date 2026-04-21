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
              disabled={isPending}
              className={cn(
                'whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                !currentLocation
                  ? 'btn-primary'
                  : 'border border-gray-100 bg-white text-gray-400 shadow-sm hover:bg-brand-50 hover:text-brand-600',
                isPending && 'cursor-not-allowed opacity-50'
              )}
            >
              {isPending && !currentLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
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
                  'flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all',
                  currentLocation === location.slug
                    ? 'btn-primary scale-105 shadow-glow-lg'
                    : 'border border-gray-100 bg-white text-gray-400 shadow-sm hover:bg-brand-50 hover:text-brand-600',
                  isPending && 'cursor-not-allowed opacity-50'
                )}
              >
                {isPending && currentLocation === location.slug ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {location.name}
                    {location.showCount !== undefined && location.showCount > 0 && (
                      <span
                        className={cn(
                          'flex h-5 min-w-[20px] items-center justify-center rounded-lg px-1.5 text-[10px] font-black',
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
