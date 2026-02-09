/**
 * Server Component: ShowDetailServer
 * Renders show details with data fetched on the server
 */

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
  branch: { id: number; name: string } | null;
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

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
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

export function ShowDetailServer({ show }: ShowDetailServerProps) {
  const bannerUrl = (show.properties?.bannerUrl as string) || show.thumbnailUrl || '';

  return (
    <>
      {/* Hero Banner Background */}
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
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <Link
            href="/shows"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40 transition-all font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-100 border border-neutral-100/50">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge
            variant={statusColors[show.status]}
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            {statusLabels[show.status]}
          </Badge>
          {show.branch && (
            <Badge variant="outline" className="text-neutral-500 border-neutral-200">
              {show.branch.name}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-gray-900 leading-tight mb-6">
          {show.title}
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-6 border-t border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                Thời gian
              </p>
              <p className="font-semibold text-gray-900">{formatDateTime(show.performTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                Địa điểm
              </p>
              <p className="font-semibold text-gray-900">{show.stage.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description Card */}
      {show.description && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100">
          <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
            <span className="text-2xl">📝</span> Giới thiệu show
          </h3>
          <div
            className="prose prose-neutral prose-lg max-w-none text-neutral-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: show.description }}
          />
        </div>
      )}

      {/* Artists Grid */}
      {show.artists && show.artists.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-xl px-2 flex items-center gap-2">
            <span className="text-2xl">🎤</span> Nghệ sĩ biểu diễn
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {show.artists.map((artist) => (
              <article
                key={artist.id}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-neutral-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 border-2 border-white shadow-md">
                  <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-500 font-bold text-xl">
                    {artist.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 group-hover:text-brand-600 transition-colors">
                    {artist.name}
                    {artist.isHeadline && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700">
                        ★ HEADLINE
                      </span>
                    )}
                  </h4>
                  {artist.bio && (
                    <p className="text-sm text-neutral-500 line-clamp-1">{artist.bio}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Venue Info Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100">
        <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
          <span className="text-2xl">📍</span> Thông tin địa điểm
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-bold text-gray-900">{show.stage.name}</h4>
            {show.stage.address && <p className="text-neutral-600">{show.stage.address}</p>}
            <p className="text-sm text-neutral-500 mt-1">{show.stage.location.name}</p>
          </div>

          {/* Map Link */}
          {show.stage.latitude && show.stage.longitude ? (
            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden border border-neutral-200 h-[200px] bg-neutral-100 flex items-center justify-center">
                <p className="text-neutral-500 text-sm">Bản đồ sẽ hiển thị ở đây</p>
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
              className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-50 text-brand-700 font-bold hover:bg-brand-100 transition-colors"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Xem bản đồ trên Google Maps
            </a>
          ) : null}

          {show.checkInTime && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100 mt-4">
              <Clock className="h-5 w-5 text-neutral-400" />
              <span className="text-sm font-medium text-neutral-600">
                Mở cửa check-in:{' '}
                <span className="text-gray-900 font-bold">{formatDateTime(show.checkInTime)}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
