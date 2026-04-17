/**
 * Tours Listing Page - ISR (Incremental Static Regeneration)
 * Server Component with revalidation every 3 minutes
 *
 * Performance improvements:
 * - Data fetched on server at build time and cached
 * - URL-based filtering with server-side data fetching
 * - Reduced client-side JavaScript bundle
 * - Better SEO with server-rendered content
 */

import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { TourFiltersClient } from '@/components/client/TourFiltersClient';
import { ToursGridServer } from '@/components/server/ToursGridServer';
import { PaginationClient } from '@/components/client/PaginationClient';
import { ToursGridSkeleton } from '@/components/server/Skeletons';
import { JsonLd } from '@/components/seo/JsonLd';
import { serverAPI, type Tour, type Location, type PaginatedData } from '@/lib/api-server';
import { buildTourListingItemListJsonLd } from '@/lib/seo-jsonld';

// ISR - Revalidate every 3 minutes
export const revalidate = 180;

// Metadata for SEO
export const metadata = {
  title: 'Tour Du Lịch Kết Hợp Show | Music Travel',
  description: 'Khám phá các tour du lịch kết hợp show âm nhạc đặc sắc. Trải nghiệm trọn vẹn với combo tiết kiệm đến 30%.',
  openGraph: {
    title: 'Tour Du Lịch Kết Hợp Show | Music Travel',
    description: 'Khám phá các tour du lịch kết hợp show âm nhạc đặc sắc',
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

// Extended Tour type for the listing page (omit nextSchedule and redefine)
interface TourListItem extends Omit<Tour, 'nextSchedule'> {
  branch: { id: number; name: string } | null;
  nextSchedule: {
    id: number;
    startDate: string;
    price: number;
    availableSlots?: number;
  } | null;
}

// Fetch tours data on the server
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
      serverAPI.tours.getAll(params).catch(() => ({
        items: [] as TourListItem[],
        meta: { page: 1, limit, total: 0, totalPages: 0 },
      })),
      serverAPI.locations.getAll().catch(() => [] as Location[]),
    ]);

    return {
      tours: (toursData?.items || []) as TourListItem[],
      meta: toursData?.meta || { page: 1, limit, total: 0, totalPages: 0 },
      locations: Array.isArray(locations) ? locations : [],
    };
  } catch (error) {
    console.error('Error fetching tours data:', error);
    return {
      tours: [],
      meta: { page: 1, limit, total: 0, totalPages: 0 },
      locations: [],
    };
  }
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const data = await fetchToursData(searchParams);
  const currentPage = parseInt(searchParams.page || '1', 10);
  const toursListSchema = buildTourListingItemListJsonLd(data.tours, currentPage, 12);

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <JsonLd data={toursListSchema} />
      {/* Hero Header */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-brand-50 text-brand-700 hover:bg-brand-50 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Khám phá Việt Nam
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-gray-900 mb-6 leading-[1.1]">
              Hành Trình <span className="text-brand-600">Âm Nhạc</span> <br /> & Khám Phá
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mb-10 leading-relaxed">
              Những chuyến đi đầy cảm hứng, kết hợp giữa vẻ đẹp thiên nhiên và những giai điệu tuyệt vời nhất.
            </p>
          </div>

          {/* Filters - Client Component */}
          <TourFiltersClient locations={data.locations} total={data.meta.total} />
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        {/* Tours Grid - Server Component */}
        <Suspense
          key={JSON.stringify(searchParams)}
          fallback={<ToursGridSkeleton count={12} />}
        >
          <ToursGridServer tours={data.tours} />
        </Suspense>

        {/* Pagination - Client Component */}
        <PaginationClient
          currentPage={currentPage}
          totalPages={data.meta.totalPages}
        />
      </section>
    </div>
  );
}
