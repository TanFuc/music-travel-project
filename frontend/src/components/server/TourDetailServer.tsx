/**
 * Server Component: TourDetailServer
 * Renders tour details with data fetched on the server
 */

import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TourSchedule {
  id: number;
  startDate: string;
  price: number;
  capacity: number;
  bookedCount: number;
  status: string;
}

interface TourDetail {
  id: number;
  title: string;
  slug: string;
  duration: string | null;
  description: string | null;
  properties: Record<string, unknown> | null;
  departureLoc: {
    id: number;
    name: string;
  } | null;
  destinationLoc: {
    id: number;
    name: string;
  } | null;
  branch: { id: number; name: string } | null;
  schedules: TourSchedule[];
}

interface TourDetailServerProps {
  tour: TourDetail;
}

export function TourDetailServer({ tour }: TourDetailServerProps) {
  const bannerUrl = (tour.properties?.bannerUrl || tour.properties?.thumbnailUrl) as string;

  return (
    <>
      {/* Hero Banner Background */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={tour.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <Link
            href="/tours"
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
          <Badge className="bg-brand-100 text-brand-700 hover:bg-brand-200 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Tour Hot
          </Badge>
          {tour.branch && (
            <Badge variant="outline" className="text-neutral-500 border-neutral-200">
              {tour.branch.name}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-gray-900 leading-tight mb-6">
          {tour.title}
        </h1>

        <div className="flex flex-wrap gap-6 pt-6 border-t border-neutral-100">
          {tour.duration && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                  Thời lượng
                </p>
                <p className="font-semibold text-gray-900">{tour.duration}</p>
              </div>
            </div>
          )}
          {tour.destinationLoc && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                  Hành trình
                </p>
                <p className="font-semibold text-gray-900">
                  {tour.departureLoc?.name} &rarr; {tour.destinationLoc.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {tour.description && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100">
          <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
            <span className="text-2xl">📝</span> Giới thiệu chương trình
          </h3>
          <div
            className="prose prose-neutral prose-lg max-w-none text-neutral-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: tour.description }}
          />
        </div>
      )}

      {/* Tour Inclusions / Exclusions (Properties) */}
      {tour.properties && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Includes */}
          {!!tour.properties.includes && (
            <div className="bg-green-50/50 rounded-3xl p-6 sm:p-8 border border-green-100">
              <h3 className="font-display font-bold text-lg text-green-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center">
                  <span className="text-green-700 text-xs">✓</span>
                </div>
                Bao gồm
              </h3>
              <ul className="space-y-3">
                {String(tour.properties.includes)
                  .split(',')
                  .map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-neutral-700">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.trim()}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Excludes */}
          {!!tour.properties.excludes && (
            <div className="bg-red-50/50 rounded-3xl p-6 sm:p-8 border border-red-100">
              <h3 className="font-display font-bold text-lg text-red-800 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center">
                  <span className="text-red-700 text-xs">✕</span>
                </div>
                Không bao gồm
              </h3>
              <ul className="space-y-3">
                {String(tour.properties.excludes)
                  .split(',')
                  .map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-neutral-700">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.trim()}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Other Highlights */}
          {Object.entries(tour.properties).filter(
            ([key]) =>
              !['includes', 'excludes', 'thumbnailUrl', 'bannerUrl', 'image', 'images'].includes(
                key
              )
          ).length > 0 && (
            <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100">
              <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                <span className="text-2xl">✨</span> Thông tin khác
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(tour.properties)
                  .filter(
                    ([key]) =>
                      ![
                        'includes',
                        'excludes',
                        'thumbnailUrl',
                        'bannerUrl',
                        'image',
                        'images',
                      ].includes(key)
                  )
                  .map(([key, value]) => (
                    <div key={key} className="flex items-start gap-4 p-4 bg-neutral-50 rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 text-brand-600 font-bold">
                        {key.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 capitalize">{key}</h4>
                        <p className="text-sm text-neutral-600 mt-1">{String(value)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
