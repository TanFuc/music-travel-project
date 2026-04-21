'use client';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/components/common/Link';
import { Search, ArrowRight, Calendar, Clock, Sparkles } from 'lucide-react';
import { ShowCard } from '@/components/shows/ShowCard';
import { get } from '@/lib/api';
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
    location: {
      name: string;
    };
  };
  minPrice: number | null;
  availableTickets: number;
  badges?: ('HOT' | 'VIP' | 'NEW' | 'SOLD_OUT' | 'SOON')[];
}
interface ShowsSectionProps {
  locationFilter?: string;
}
type TabType = 'ongoing' | 'upcoming' | 'future';
export function ShowsSection({ locationFilter }: ShowsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const { data: allShows = [], isLoading } = useQuery({
    queryKey: ['home-shows-all', locationFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: '100',
        status: 'UPCOMING',
      });
      if (locationFilter) {
        params.append('location', locationFilter);
      }
      const response = await get<{
        items: Show[];
        meta: unknown;
      }>(`/shows?${params}`);
      return response.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });
  const categories = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysLater = today + 7 * 24 * 60 * 60 * 1000;
    const filtered = searchQuery
      ? allShows.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : allShows;
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
  }, [allShows, searchQuery]);
  const activeShows = categories[activeTab];
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

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse overflow-hidden rounded-xl">
                <div className="aspect-[3/4] bg-gray-200" />
                <div className="space-y-4 p-6">
                  <div className="h-6 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-10 w-full rounded-xl bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : activeShows.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {activeShows.map((show, index) => (
              <div
                key={show.id}
                className="animate-fadeIn opacity-0"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'forwards',
                }}
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
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 font-bold text-brand-600 hover:underline"
            >
              Xem tất cả các show khác
            </button>
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/shows"
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
