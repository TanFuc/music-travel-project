import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { ShowFiltersClient } from '@/components/client/ShowFiltersClient';
import { ShowsGridServer } from '@/components/server/ShowsGridServer';
import { PaginationClient } from '@/components/client/PaginationClient';
import { ShowsGridSkeleton } from '@/components/server/Skeletons';
import { JsonLd } from '@/components/seo/JsonLd';
import { serverAPI, type Show, type Location } from '@/lib/api-server';
import { buildShowListingItemListJsonLd } from '@/lib/seo-jsonld';
export const revalidate = 180;
export const metadata = {
  title: 'Tất Cả Show Diễn | Music Travel',
  description:
    'Khám phá các show âm nhạc đặc sắc khắp Việt Nam. Đặt vé ngay để không bỏ lỡ những đêm nhạc tuyệt vời.',
  openGraph: {
    title: 'Tất Cả Show Diễn | Music Travel',
    description: 'Khám phá các show âm nhạc đặc sắc khắp Việt Nam',
    type: 'website',
  },
};
interface SearchParams {
  location?: string;
  search?: string;
  page?: string;
}
async function fetchShowsData(searchParams: SearchParams) {
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
    if (searchParams.search) {
      params.search = searchParams.search;
    }
    const [showsData, locations] = await Promise.all([
      serverAPI.shows
        .getAll(params)
        .catch(() => ({ items: [] as Show[], meta: { page: 1, limit, total: 0, totalPages: 0 } })),
      serverAPI.locations.getAll().catch(() => [] as Location[]),
    ]);
    return {
      shows: showsData?.items || [],
      meta: showsData?.meta || { page: 1, limit, total: 0, totalPages: 0 },
      locations: Array.isArray(locations) ? locations : [],
    };
  } catch (error) {
    return {
      shows: [],
      meta: { page: 1, limit, total: 0, totalPages: 0 },
      locations: [],
    };
  }
}
export default async function ShowsPage({ searchParams }: { searchParams: SearchParams }) {
  const data = await fetchShowsData(searchParams);
  const currentPage = parseInt(searchParams.page || '1', 10);
  const showsListSchema = buildShowListingItemListJsonLd(data.shows, currentPage, 12);
  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <JsonLd data={showsListSchema} />

      <section className="relative overflow-hidden pb-16 pt-24">
        <div className="absolute right-0 top-0 h-full w-1/4 -translate-y-1/2 translate-x-1/2 rounded-full bg-brand-500/5 blur-[100px]" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="mb-4 border-none bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 hover:bg-brand-50">
              Lịch Diễn Live Music
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-extrabold leading-[1.1] text-gray-900 md:text-6xl">
              Sống Với <span className="text-brand-600">Giai Điệu</span> <br /> & Tình Yêu
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-gray-600">
              Những đêm nhạc đầy cảm xúc tại các sân khấu tuyệt vời nhất Việt Nam.
            </p>
          </div>

          <ShowFiltersClient locations={data.locations} total={data.meta.total} />
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <Suspense key={JSON.stringify(searchParams)} fallback={<ShowsGridSkeleton count={12} />}>
          <ShowsGridServer shows={data.shows} />
        </Suspense>

        <PaginationClient currentPage={currentPage} totalPages={data.meta.totalPages} />
      </section>
    </div>
  );
}
