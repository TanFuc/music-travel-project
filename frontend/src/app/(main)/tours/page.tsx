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
  title: 'Tour Du Lịch Khám Phá | Music Travel',
  description:
    'Khám phá các tour du lịch sinh thái đặc sắc. Trải nghiệm trọn vẹn vẻ đẹp thiên nhiên.',
  openGraph: {
    title: 'Tour Du Lịch Khám Phá | Music Travel',
    description: 'Khám phá các tour du lịch sinh thái đặc sắc',
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
async function fetchToursData(searchParams: SearchParams) {
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
      serverAPI.tours.getAll(params),
      serverAPI.locations.getAll().catch(() => [] as Location[]),
    ]);
    return {
      tours: (toursData?.items || []) as Tour[],
      meta: toursData?.meta || { page: 1, limit, total: 0, totalPages: 0 },
      locations: Array.isArray(locations) ? locations : [],
    };
  } catch (error) {
    return {
      tours: [],
      meta: { page: 1, limit, total: 0, totalPages: 0 },
      locations: [],
    };
  }
}
export default async function ToursPage({ searchParams }: { searchParams: SearchParams }) {
  const data = await fetchToursData(searchParams);
  const currentPage = parseInt(searchParams.page || '1', 10);
  const toursListSchema = buildTourListingItemListJsonLd(data.tours, currentPage, 12);
  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <JsonLd data={toursListSchema} />

      <section className="relative overflow-hidden pb-16 pt-24">
        <div className="absolute right-0 top-0 h-full w-1/3 -translate-y-1/2 translate-x-1/3 rounded-full bg-brand-500/5 blur-[120px]" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="mb-4 border-none bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 hover:bg-brand-50">
              Khám phá Việt Nam
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-extrabold leading-[1.1] text-gray-900 md:text-6xl">
              Tour Du Lịch <span className="text-brand-600">Khám Phá</span> <br /> Xanh
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-gray-600">
              Những chuyến đi đầy cảm hứng, tận hưởng vẻ đẹp thiên nhiên hùng vĩ và tìm về sự bình
              yên.
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
