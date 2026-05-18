import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getOptimizedImageUrl, optimizeHtmlImages } from '@/lib/image-utils';
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
  isCombo: boolean;
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
  children?: React.ReactNode;
  sidebarChildren?: React.ReactNode;
}
import { RelatedProducts } from '@/components/common/RelatedProducts';
export function TourDetailServer({ tour, children, sidebarChildren }: TourDetailServerProps) {
  const bannerUrl = (tour.properties?.bannerUrl || tour.properties?.thumbnailUrl) as string;
  return (
    <div className="pb-20">
      <section className="relative h-[65vh] min-h-[500px] w-full overflow-hidden">
        {bannerUrl ? (
          <Image
            src={getOptimizedImageUrl(bannerUrl, 'hero')}
            alt={tour.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={78}
            unoptimized
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-900 to-brand-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/20 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end pb-12 lg:pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/tours"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-xl transition-all hover:bg-white/30"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </Link>
                <Badge className="border-none bg-brand-600 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl ring-1 ring-white/20">
                  {tour.isCombo ? 'Combo Đặc Biệt' : 'Tour Khám Phá'}
                </Badge>
                {tour.branch && (
                  <Badge
                    variant="outline"
                    className="border-white/30 px-4 py-2.5 text-[10px] font-bold text-white backdrop-blur-sm"
                  >
                    {tour.branch.name}
                  </Badge>
                )}
              </div>

              <h1 className="mb-8 font-display text-4xl font-black leading-[1.1] text-white sm:text-5xl md:text-7xl">
                {tour.title}
              </h1>

              <div className="flex flex-wrap gap-12 text-white/90">
                {tour.duration && (
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xl">
                      <Clock className="h-7 w-7 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-300">
                        Thời lượng
                      </p>
                      <p className="text-xl font-bold">{tour.duration}</p>
                    </div>
                  </div>
                )}
                {tour.destinationLoc && (
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xl">
                      <MapPin className="h-7 w-7 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-300">
                        Điểm đến
                      </p>
                      <p className="text-xl font-bold">{tour.destinationLoc.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="space-y-20 lg:col-span-8">
            {tour.description && (
              <section className="animate-fadeIn relative">
                <div className="mb-14 flex items-center gap-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-white shadow-xl">
                    <span className="text-xl font-black">01</span>
                  </div>
                  <h2 className="font-display text-4xl font-black uppercase tracking-tighter text-gray-900">
                    LỊCH TRÌNH CHI TIẾT
                  </h2>
                  <div className="h-0.5 flex-1 rounded-full bg-brand-100/50" />
                </div>
                <div className="relative pl-12">
                  <div className="absolute bottom-0 left-[23px] top-6 w-0.5 bg-gradient-to-b from-brand-200 via-brand-100 to-transparent" />
                  <div
                    className="rich-content max-w-none"
                    dangerouslySetInnerHTML={{ __html: optimizeHtmlImages(tour.description) }}
                  />
                </div>
              </section>
            )}

            {children}

            {tour.properties && (
              <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {!!tour.properties.includes && (
                  <div className="rounded-[40px] border border-emerald-100 bg-emerald-50/50 p-10 shadow-sm">
                    <h3 className="mb-8 flex items-center gap-4 font-display text-xl font-black uppercase tracking-wide text-emerald-900">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                        <span className="text-lg font-black">✓</span>
                      </div>
                      Bao gồm
                    </h3>
                    <ul className="space-y-5">
                      {String(tour.properties.includes)
                        .split(',')
                        .map((item, idx) => (
                          <li key={idx} className="flex items-start gap-4">
                            <div className="mt-2.5 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                            <span className="text-base font-medium leading-relaxed text-emerald-800/80">
                              {item.trim()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {!!tour.properties.excludes && (
                  <div className="rounded-[40px] border border-rose-100 bg-rose-50/50 p-10 shadow-sm">
                    <h3 className="mb-8 flex items-center gap-4 font-display text-xl font-black uppercase tracking-wide text-rose-900">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg">
                        <span className="text-lg font-black">✕</span>
                      </div>
                      Chưa bao gồm
                    </h3>
                    <ul className="space-y-5">
                      {String(tour.properties.excludes)
                        .split(',')
                        .map((item, idx) => (
                          <li key={idx} className="flex items-start gap-4">
                            <div className="mt-2.5 h-2 w-2 flex-shrink-0 rounded-full bg-rose-400" />
                            <span className="text-base font-medium leading-relaxed text-rose-800/80">
                              {item.trim()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {Object.entries(tour.properties).filter(
                  ([key, value]) =>
                    ![
                      'includes',
                      'excludes',
                      'thumbnailUrl',
                      'bannerUrl',
                      'image',
                      'images',
                      'ticketTypes',
                      'locationText',
                      'slug',
                    ].includes(key) &&
                    (typeof value === 'string' || typeof value === 'number')
                ).length > 0 && (
                  <div className="rounded-[40px] border border-brand-100 bg-white p-10 shadow-xl shadow-brand-900/5 md:col-span-2">
                    <h3 className="mb-10 font-display text-2xl font-black uppercase tracking-tight text-gray-900">
                      Lưu ý quan trọng
                    </h3>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      {Object.entries(tour.properties)
                        .filter(
                          ([key, value]) =>
                            ![
                              'includes',
                              'excludes',
                              'thumbnailUrl',
                              'bannerUrl',
                              'image',
                              'images',
                              'ticketTypes',
                              'locationText',
                              'slug',
                            ].includes(key) &&
                            (typeof value === 'string' || typeof value === 'number')
                        )
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="flex flex-col gap-3 rounded-3xl bg-brand-50/30 p-6 ring-1 ring-brand-100/50"
                          >
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand-600">
                              {key}
                            </h4>
                            <p className="text-base font-bold leading-relaxed text-gray-800">
                              {String(value)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              <div className="custom-scrollbar max-h-[calc(100vh-140px)] overflow-y-auto pr-4">
                <div className="space-y-8 pb-8">
                  {sidebarChildren}

                  <div className="rounded-[40px] border border-brand-100 bg-white p-8 shadow-xl shadow-brand-900/5">
                    <h4 className="mb-6 font-display text-lg font-black uppercase tracking-wide text-gray-900">
                      Tại sao chọn chúng tôi?
                    </h4>
                    <ul className="space-y-5">
                      {[
                        'Hỗ trợ khách hàng 24/7 qua Hotline',
                        'Cam kết giá tốt nhất thị trường',
                        'Hành trình xanh, bảo vệ môi trường',
                        'Bảo hiểm du lịch trọn gói cao cấp',
                      ].map((text, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-4 text-sm font-semibold text-gray-600"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                            <span className="text-[10px] font-black">✓</span>
                          </div>
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <RelatedProducts currentId={tour.id} type={tour.isCombo ? 'combo' : 'tour'} />
      </div>
    </div>
  );
}
