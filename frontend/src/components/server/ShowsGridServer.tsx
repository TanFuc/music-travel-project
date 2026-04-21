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
export function ShowsGridServer({
  shows,
  emptyMessage = 'Chưa có lịch diễn',
}: ShowsGridServerProps) {
  if (!shows || shows.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
          <Music className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-gray-900">{emptyMessage}</h3>
        <p className="mx-auto mb-8 max-w-sm text-gray-500">
          Vui lòng quay lại sau hoặc thử thay đổi điều kiện tìm kiếm.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {shows.map((show, idx) => {
        const badges: ('HOT' | 'VIP' | 'NEW' | 'SOLD_OUT' | 'SOON')[] = [];
        if (show.availableTickets !== undefined) {
          if (show.availableTickets < 50 && show.availableTickets > 0) badges.push('HOT');
          if (show.availableTickets === 0) badges.push('SOLD_OUT');
        }
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
