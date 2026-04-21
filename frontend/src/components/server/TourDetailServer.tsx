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
  branch: {
    id: number;
    name: string;
  } | null;
  schedules: TourSchedule[];
}
interface TourDetailServerProps {
  tour: TourDetail;
}
export function TourDetailServer({ tour }: TourDetailServerProps) {
  const bannerUrl = (tour.properties?.bannerUrl || tour.properties?.thumbnailUrl) as string;
  return (
    <>
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
          <div className="h-full w-full bg-gradient-to-br from-brand-400 to-brand-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="absolute left-4 top-6 z-20 sm:left-8">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/40"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-100/50 bg-white p-6 shadow-xl shadow-neutral-100 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Badge className="border-none bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 hover:bg-brand-200">
            Tour Hot
          </Badge>
          {tour.branch && (
            <Badge variant="outline" className="border-neutral-200 text-neutral-500">
              {tour.branch.name}
            </Badge>
          )}
        </div>

        <h1 className="mb-6 font-display text-3xl font-black leading-tight text-gray-900 sm:text-4xl md:text-5xl">
          {tour.title}
        </h1>

        <div className="flex flex-wrap gap-6 border-t border-neutral-100 pt-6">
          {tour.duration && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Thời lượng
                </p>
                <p className="font-semibold text-gray-900">{tour.duration}</p>
              </div>
            </div>
          )}
          {tour.destinationLoc && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
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

      {tour.description && (
        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-bold">
            <span className="text-2xl">📝</span> Giới thiệu chương trình
          </h3>
          <div
            className="prose prose-neutral prose-lg max-w-none leading-relaxed text-neutral-600"
            dangerouslySetInnerHTML={{ __html: tour.description }}
          />
        </div>
      )}

      {tour.properties && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {!!tour.properties.includes && (
            <div className="rounded-3xl border border-green-100 bg-green-50/50 p-6 sm:p-8">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-green-800">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-200">
                  <span className="text-xs text-green-700">✓</span>
                </div>
                Bao gồm
              </h3>
              <ul className="space-y-3">
                {String(tour.properties.includes)
                  .split(',')
                  .map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-neutral-700">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                      <span className="text-sm font-medium">{item.trim()}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {!!tour.properties.excludes && (
            <div className="rounded-3xl border border-red-100 bg-red-50/50 p-6 sm:p-8">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-red-800">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-200">
                  <span className="text-xs text-red-700">✕</span>
                </div>
                Không bao gồm
              </h3>
              <ul className="space-y-3">
                {String(tour.properties.excludes)
                  .split(',')
                  .map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-neutral-700">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                      <span className="text-sm font-medium">{item.trim()}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {Object.entries(tour.properties).filter(
            ([key]) =>
              !['includes', 'excludes', 'thumbnailUrl', 'bannerUrl', 'image', 'images'].includes(
                key
              )
          ).length > 0 && (
            <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm sm:p-8 md:col-span-2">
              <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-bold">
                <span className="text-2xl">✨</span> Thông tin khác
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <div key={key} className="flex items-start gap-4 rounded-2xl bg-neutral-50 p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-600">
                        {key.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold capitalize text-gray-900">{key}</h4>
                        <p className="mt-1 text-sm text-neutral-600">{String(value)}</p>
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
