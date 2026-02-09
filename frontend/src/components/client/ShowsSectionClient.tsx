'use client';

import { useState, useMemo } from 'react';
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
    location?: { name: string };
  };
  minPrice: number | null;
  availableTickets?: number;
  badges?: ('HOT' | 'VIP' | 'NEW' | 'SOLD_OUT' | 'SOON')[];
}

interface ShowsSectionClientProps {
  initialShows: Show[];
}

type TabType = 'ongoing' | 'upcoming' | 'future';

export function ShowsSectionClient({ initialShows }: ShowsSectionClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const categories = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysLater = today + 7 * 24 * 60 * 60 * 1000;

    const filtered = searchQuery
      ? initialShows.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : initialShows;

    const ongoing: Show[] = [];
    const upcoming: Show[] = [];
    const future: Show[] = [];

    filtered.forEach(show => {
      const showDate = new Date(show.performTime);
      const showTime = new Date(showDate.getFullYear(), showDate.getMonth(), showDate.getDate()).getTime();

      if (showTime === today || show.status === 'ONGOING') {
        ongoing.push(show);
      } else if (showTime > today && showTime <= sevenDaysLater) {
        upcoming.push(show);
      } else if (showTime > sevenDaysLater) {
        future.push(show);
      }
    });

    return { ongoing, upcoming, future };
  }, [initialShows, searchQuery]);

  const activeShows = categories[activeTab];

  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-brand-200/20 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-accent-200/20 blur-[100px] rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Content */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs md:text-sm font-bold uppercase tracking-wider animate-fadeIn">
            <Sparkles className="w-4 h-4" />
            Sân khấu âm nhạc đỉnh cao
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 leading-tight">
              Lịch trình <span className="text-brand-600">Show Diễn</span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 font-sans max-w-2xl mx-auto">
              Chúng tôi mang đến những đêm nhạc đong đầy cảm xúc tại những không gian thơ mộng nhất Việt Nam.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full max-w-md mx-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            <input
              type="text"
              placeholder="Bạn đang tìm nghệ sĩ hay show diễn nào?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 backdrop-blur-md border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {[
            { id: 'ongoing', label: 'Đang diễn ra', icon: <Clock className="w-4 h-4" /> },
            { id: 'upcoming', label: 'Sắp diễn ra', icon: <Calendar className="w-4 h-4" /> },
            { id: 'future', label: 'Chưa diễn ra', icon: <Calendar className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap shrink-0',
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              )}
            >
              {tab.icon}
              {tab.label}
              <span className={cn(
                'ml-1 text-[10px] px-2 py-0.5 rounded-full font-black',
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
              )}>
                {categories[tab.id as TabType].length}
              </span>
            </button>
          ))}
        </div>

        {/* Grid Display */}
        {activeShows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {activeShows.map((show, index) => (
              <div
                key={show.id}
                className="animate-fadeIn opacity-0"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <ShowCard {...show} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <p className="text-gray-500 text-base font-medium">
              {searchQuery ? 'Không tìm thấy show nào phù hợp với từ khóa' : 'Hiện chưa có show diễn nào ở mục này'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-brand-600 font-bold hover:underline"
              >
                Xem tất cả các show khác
              </button>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-16 text-center">
          <Link
            href="/shows"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition-all hover:shadow-xl hover:-translate-y-1 group"
          >
            KHÁM PHÁ TOÀN BỘ SHOW DIỄN
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
