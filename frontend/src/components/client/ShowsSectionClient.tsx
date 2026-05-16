'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/components/common/Link';
import { Search, ArrowRight, Calendar, Clock, Sparkles } from 'lucide-react';
import { ShowCard } from '@/components/shows/ShowCard';
import { cn } from '@/lib/utils';
interface Show {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  performTime: string;
  status: string;
  stage: {
    name: string;
    location?: {
      name: string;
      slug?: string;
    };
  };
  minPrice: number | null;
  availableTickets?: number;
  badges?: ('HOT' | 'VIP' | 'NEW' | 'SOLD_OUT' | 'SOON')[];
  linkedTours?: {
    departureLoc: {
      name: string;
      slug?: string;
    } | null;
    destinationLoc: {
      name: string;
      slug?: string;
    } | null;
  }[];
}
interface ShowsSectionClientProps {
  initialShows: Show[];
}
type TabType = 'ongoing' | 'upcoming' | 'future';
export function ShowsSectionClient({ initialShows }: ShowsSectionClientProps) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    searchParams.get('location')
  );
  useEffect(() => {
    const handleLocationChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        location: string | null;
      }>;
      setSelectedLocation(customEvent.detail.location);
    };
    window.addEventListener('home-location-change', handleLocationChange);
    return () => window.removeEventListener('home-location-change', handleLocationChange);
  }, []);
  const categories = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysLater = today + 7 * 24 * 60 * 60 * 1000;
    const locationFiltered = selectedLocation
      ? initialShows.filter((show) => {
          if (show.stage.location?.slug === selectedLocation) return true;
          if (show.linkedTours) {
            return show.linkedTours.some(
              (t) =>
                t.departureLoc?.slug === selectedLocation ||
                t.destinationLoc?.slug === selectedLocation
            );
          }
          return false;
        })
      : initialShows;
    const filtered = searchQuery
      ? locationFiltered.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : locationFiltered;
    const ongoing: Show[] = [];
    const upcoming: Show[] = [];
    const future: Show[] = [];
    filtered.forEach((show) => {
      const showDate = new Date(show.performTime);
      const showTime = new Date(
        showDate.getFullYear(),
        showDate.getMonth(),
        showDate.getDate()
      ).getTime();
      if (showTime === today || show.status === 'ONGOING') {
        ongoing.push(show);
      } else if (showTime > today && showTime <= sevenDaysLater) {
        upcoming.push(show);
      } else if (showTime > sevenDaysLater) {
        future.push(show);
      }
    });
    return { ongoing, upcoming, future };
  }, [initialShows, searchQuery, selectedLocation]);
  const activeShows = categories[activeTab];
  const showsHref = selectedLocation ? `/shows?location=${selectedLocation}` : '/shows';
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/4 rounded-full bg-brand-200/20 blur-[100px]" />
      <div className="bg-accent-200/20 absolute bottom-0 left-0 h-96 w-96 -translate-x-1/4 translate-y-1/2 rounded-full blur-[100px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto mb-12 flex max-w-4xl flex-col items-center space-y-6 text-center">
          <div className="animate-fadeIn inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 md:text-sm">
            <Sparkles className="h-4 w-4" />
            Sân khấu âm nhạc đỉnh cao
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
              Lịch trình <span className="text-brand-600">Show Diễn</span>
            </h2>
            <p className="mx-auto max-w-2xl font-sans text-base text-gray-600 md:text-lg">
              Chúng tôi mang đến những đêm nhạc đong đầy cảm xúc tại những không gian thơ mộng nhất
              Việt Nam.
            </p>
          </div>

          <div className="group relative mx-auto w-full max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-brand-500" />
            <input
              type="text"
              placeholder="Bạn đang tìm nghệ sĩ hay show diễn nào?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/80 py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm backdrop-blur-md transition-all placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          {[
            { id: 'ongoing', label: 'Đang diễn ra', icon: <Clock className="h-4 w-4" /> },
            { id: 'upcoming', label: 'Sắp diễn ra', icon: <Calendar className="h-4 w-4" /> },
            { id: 'future', label: 'Chưa diễn ra', icon: <Calendar className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-6 py-3 text-xs font-bold transition-all duration-300 sm:text-sm',
                activeTab === tab.id
                  ? 'scale-105 bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'border border-gray-100 bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              {tab.icon}
              {tab.label}
              <span
                className={cn(
                  'ml-1 rounded-full px-2 py-0.5 text-[10px] font-black',
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                )}
              >
                {categories[tab.id as TabType].length}
              </span>
            </button>
          ))}
        </div>

        {activeShows.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {activeShows.map((show, index) => (
              <div
                key={show.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ShowCard {...show} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-20 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Calendar className="h-8 w-8" />
            </div>
            <p className="text-base font-medium text-gray-500">
              {searchQuery
                ? 'Không tìm thấy show nào phù hợp với từ khóa'
                : 'Hiện chưa có show diễn nào ở mục này'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 font-bold text-brand-600 hover:underline"
              >
                Xem tất cả các show khác
              </button>
            )}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            href={showsHref}
            className="group inline-flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:bg-black hover:shadow-xl"
          >
            KHÁM PHÁ TOÀN BỘ SHOW DIỄN
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
