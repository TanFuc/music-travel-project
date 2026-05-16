import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { Calendar, MapPin, Clock, ArrowLeft, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
interface Artist {
  id: number;
  name: string;
  bio: string | null;
  socialLinks: Record<string, string> | null;
  isHeadline: boolean;
}
interface ShowDetail {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  performTime: string;
  checkInTime: string | null;
  thumbnailUrl?: string | null;
  status: string;
  branch: {
    id: number;
    name: string;
  } | null;
  seatSelectionEnabled: boolean;
  properties: Record<string, unknown> | null;
  stage: {
    id: number;
    name: string;
    address: string | null;
    mapLink: string | null;
    latitude?: number;
    longitude?: number;
    location: {
      id: number;
      name: string;
    };
  };
  artists: Artist[];
}
interface ShowDetailServerProps {
  show: ShowDetail;
}
const statusColors: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'success' | 'warning'
> = {
  UPCOMING: 'success',
  ONGOING: 'warning',
  ENDED: 'secondary',
  CANCELLED: 'destructive',
};
const statusLabels: Record<string, string> = {
  UPCOMING: 'Sắp diễn ra',
  ONGOING: 'Đang diễn ra',
  ENDED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};
export function ShowHero({ show }: ShowDetailServerProps) {
  const bannerUrl = (show.properties?.bannerUrl as string) || show.thumbnailUrl || '';
  return (
    <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
      {bannerUrl ? (
        <Image
          src={bannerUrl}
          alt={show.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-brand-100 to-brand-300" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

      <div className="absolute left-4 top-6 z-20 sm:left-8">
        <Link
          href="/shows"
          className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/40"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </div>
    </div>
  );
}
export function ShowDetailServer({ show }: ShowDetailServerProps) {
  const cleanDescription = (html: string) => {
    if (!html) return '';
    return html.replace(/(_\d+x\d+)(\.(jpe?g|png|webp|gif))/gi, '$2');
  };
  return (
    <>
      <div className="rounded-3xl border border-neutral-100/50 bg-white p-6 shadow-xl shadow-neutral-100 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Badge
            variant={statusColors[show.status]}
            className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
          >
            {statusLabels[show.status]}
          </Badge>
          {show.branch && (
            <Badge variant="outline" className="border-neutral-200 text-neutral-500">
              {show.branch.name}
            </Badge>
          )}
        </div>

        <h1 className="mb-6 font-display text-3xl font-black leading-tight text-gray-900 sm:text-4xl md:text-5xl">
          {show.title}
        </h1>

        <div className="flex flex-col gap-4 border-t border-neutral-100 pt-6 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Thời gian
              </p>
              <p className="font-semibold text-gray-900">{formatDateTime(show.performTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Địa điểm
              </p>
              <p className="font-semibold text-gray-900">{show.stage.name}</p>
            </div>
          </div>
        </div>
      </div>

      {show.description && (
        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-bold">
            <span className="text-2xl">📝</span> Giới thiệu show
          </h3>
          <div
            className="rich-content max-w-none"
            dangerouslySetInnerHTML={{ __html: cleanDescription(show.description) }}
          />
        </div>
      )}

      {show.artists && show.artists.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 px-2 font-display text-xl font-bold">
            <span className="text-2xl">🎤</span> Nghệ sĩ biểu diễn
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {show.artists.map((artist) => (
              <article
                key={artist.id}
                className="group flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-4 transition-all duration-300 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5"
              >
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-neutral-100 shadow-md">
                  <div className="flex h-full w-full items-center justify-center bg-brand-50 text-xl font-bold text-brand-500">
                    {artist.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                    {artist.name}
                    {artist.isHeadline && (
                      <span className="ml-2 inline-flex items-center rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-bold text-yellow-700">
                        ★ HEADLINE
                      </span>
                    )}
                  </h4>
                  {artist.bio && (
                    <p className="line-clamp-1 text-sm text-neutral-500">{artist.bio}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-bold">
          <span className="text-2xl">📍</span> Thông tin địa điểm
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-bold text-gray-900">{show.stage.name}</h4>
            {show.stage.address && <p className="text-neutral-600">{show.stage.address}</p>}
            <p className="mt-1 text-sm text-neutral-500">{show.stage.location.name}</p>
          </div>

          {show.stage.latitude && show.stage.longitude ? (
            <div className="space-y-3">
              <div className="flex h-[200px] items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                <p className="text-sm text-neutral-500">Bản đồ sẽ hiển thị ở đây</p>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${show.stage.latitude},${show.stage.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 hover:underline"
              >
                <Navigation className="h-4 w-4" />
                Chỉ đường đến địa điểm
              </a>
            </div>
          ) : show.stage.mapLink ? (
            <a
              href={show.stage.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl bg-brand-50 px-6 py-3 font-bold text-brand-700 transition-colors hover:bg-brand-100"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Xem bản đồ trên Google Maps
            </a>
          ) : null}

          {show.checkInTime && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
              <Clock className="h-5 w-5 text-neutral-400" />
              <span className="text-sm font-medium text-neutral-600">
                Mở cửa check-in:{' '}
                <span className="font-bold text-gray-900">{formatDateTime(show.checkInTime)}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
