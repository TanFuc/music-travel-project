/**
 * Server Component: ShowsGridServer
 * Renders the shows grid with data passed from the server
 */

import { ShowCard } from '@/components/shows/ShowCard';
import { Music } from 'lucide-react';

interface Show {
  id: number;
  title: string;
  slug: string;
  description?: string;
  performTime: string;
  status: string;
  stage: {
    id: number;
    name: string;
    location?: {
      id?: number;
      name: string;
    };
  };
  minPrice: number | null;
  availableTickets?: number;
  thumbnailUrl?: string;
  badges?: ('HOT' | 'VIP' | 'NEW' | 'SOLD_OUT' | 'SOON')[];
}

interface ShowsGridServerProps {
  shows: Show[];
  emptyMessage?: string;
}

export function ShowsGridServer({ shows, emptyMessage = 'Chưa có lịch diễn' }: ShowsGridServerProps) {
  if (!shows || shows.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-6">
          <Music className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Vui lòng quay lại sau hoặc thử thay đổi điều kiện tìm kiếm.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {shows.map((show, idx) => {
        // Calculate badges based on show data
        const badges: ('HOT' | 'VIP' | 'NEW' | 'SOLD_OUT' | 'SOON')[] = [];
        if (show.availableTickets !== undefined) {
          if (show.availableTickets < 50 && show.availableTickets > 0) badges.push('HOT');
          if (show.availableTickets === 0) badges.push('SOLD_OUT');
        }
        // Add NEW badge for first 2 items
        if (idx < 2) badges.push('NEW');

        return (
          <article
            key={show.id}
            className="animate-fadeIn opacity-0"
            style={{
              animationDelay: `${idx * 0.05}s`,
              animationFillMode: 'forwards',
            }}
          >
            <ShowCard
              id={show.id}
              title={show.title}
              slug={show.slug}
              performTime={show.performTime}
              status={show.status}
              stage={{
                name: show.stage.name,
                location: show.stage.location || { name: '' },
              }}
              minPrice={show.minPrice}
              availableTickets={show.availableTickets}
              thumbnailUrl={show.thumbnailUrl}
              badges={badges}
            />
          </article>
        );
      })}
    </div>
  );
}
