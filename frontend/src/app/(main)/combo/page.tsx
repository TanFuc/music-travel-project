import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { TourFiltersClient } from '@/components/client/TourFiltersClient';
import { ToursGridServer } from '@/components/server/ToursGridServer';
import { PaginationClient } from '@/components/client/PaginationClient';
import { ToursGridSkeleton } from '@/components/server/Skeletons';
import { JsonLd } from '@/components/seo/JsonLd';
import { serverAPI, type Tour, type Location } from '@/lib/api-server';
import { buildTourListingItemListJsonLd } from '@/lib/seo-jsonld';
export const revalidate = 180;
export const metadata = {
  title: 'Combo Shows & Tours | Music Travel',
  description:
    'Sự kết hợp hoàn hảo giữa Tour Du Lịch Sinh Thái và Đêm Nhạc Live đỉnh cao. Tiết kiệm lên đến 30%.',
  openGraph: {
    title: 'Combo Shows & Tours | Music Travel',
    description: 'Trải nghiệm du lịch kết hợp thưởng thức biểu diễn âm nhạc chất lượng.',
    type: 'website',
  },
};
interface SearchParams {
  location?: string;
  departure?: string;
  destination?: string;
  search?: string;
  page?: string;
}
async function fetchComboData(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 12;
  try {
    const params: Record<string, string | number> = {
      page,
      limit,
    };
    if (searchParams.location && searchParams.location !== 'all') {
      params.location = searchParams.location;
    }
    if (searchParams.departure && searchParams.departure !== 'all') {
      params.departure = searchParams.departure;
    }
    if (searchParams.destination && searchParams.destination !== 'all') {
      params.destination = searchParams.destination;
    }
    if (searchParams.search) {
      params.search = searchParams.search;
    }
    const [toursData, locations] = await Promise.all([
      serverAPI.combos.getAll(params),
      serverAPI.locations.getAll().catch(() => [] as Location[]),
    ]);
    return {
      tours: (toursData?.items || []) as Tour[],
      meta: toursData?.meta || { page: 1, limit, total: 0, totalPages: 0 },
      locations: Array.isArray(locations) ? locations : [],
    };
  } catch {
    return {
      tours: [],
      meta: { page: 1, limit, total: 0, totalPages: 0 },
      locations: [],
    };
  }
}
export default async function ComboPage({ searchParams }: { searchParams: SearchParams }) {
  const data = await fetchComboData(searchParams);
  const currentPage = parseInt(searchParams.page || '1', 10);
  const toursListSchema = buildTourListingItemListJsonLd(data.tours, currentPage, 12);
  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <JsonLd data={toursListSchema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-16 pt-24">
        <div className="absolute right-0 top-0 h-full w-1/3 -translate-y-1/2 translate-x-1/3 rounded-full bg-brand-500/5 blur-[120px]" />

        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="mb-4 border border-indigo-200 bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
              Trải Nghiệm Toàn Diện
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-extrabold leading-[1.1] text-gray-900 md:text-5xl lg:text-6xl">
              Siêu Combo <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tour & Đêm Nhạc
              </span>
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-gray-600">
              Gói dịch vụ hoàn hảo mang đến cho bạn chuyến du lịch sinh thái cùng những phút giây
              thưởng thức nghệ thuật sâu lắng. Tiết kiệm hơn!
            </p>
          </div>

          <TourFiltersClient locations={data.locations} total={data.meta.total} />
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <Suspense key={JSON.stringify(searchParams)} fallback={<ToursGridSkeleton count={12} />}>
          <ToursGridServer tours={data.tours} />
        </Suspense>

        <PaginationClient currentPage={currentPage} totalPages={data.meta.totalPages} />
      </section>
    </div>
  );
}
