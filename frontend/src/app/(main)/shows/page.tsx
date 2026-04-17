/**
 * Shows Listing Page - ISR (Incremental Static Regeneration)
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
import { ShowFiltersClient } from '@/components/client/ShowFiltersClient';
import { ShowsGridServer } from '@/components/server/ShowsGridServer';
import { PaginationClient } from '@/components/client/PaginationClient';
import { ShowsGridSkeleton } from '@/components/server/Skeletons';
import { JsonLd } from '@/components/seo/JsonLd';
import { serverAPI, type Show, type Location, type PaginatedData } from '@/lib/api-server';
import { buildShowListingItemListJsonLd } from '@/lib/seo-jsonld';

// ISR - Revalidate every 3 minutes
export const revalidate = 180;

// Metadata for SEO
export const metadata = {
  title: 'Tất Cả Show Diễn | Music Travel',
  description: 'Khám phá các show âm nhạc đặc sắc khắp Việt Nam. Đặt vé ngay để không bỏ lỡ những đêm nhạc tuyệt vời.',
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

// Fetch shows data on the server
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
      serverAPI.shows.getAll(params).catch(() => ({ items: [] as Show[], meta: { page: 1, limit, total: 0, totalPages: 0 } })),
      serverAPI.locations.getAll().catch(() => [] as Location[]),
    ]);

    return {
      shows: showsData?.items || [],
      meta: showsData?.meta || { page: 1, limit, total: 0, totalPages: 0 },
      locations: Array.isArray(locations) ? locations : [],
    };
  } catch (error) {
    console.error('Error fetching shows data:', error);
    return {
      shows: [],
      meta: { page: 1, limit, total: 0, totalPages: 0 },
      locations: [],
    };
  }
}

export default async function ShowsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const data = await fetchShowsData(searchParams);
  const currentPage = parseInt(searchParams.page || '1', 10);
  const showsListSchema = buildShowListingItemListJsonLd(data.shows, currentPage, 12);

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <JsonLd data={showsListSchema} />
      {/* Hero Header */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-brand-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-brand-50 text-brand-700 hover:bg-brand-50 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Lịch Diễn Live Music
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-gray-900 mb-6 leading-[1.1]">
              Sống Với <span className="text-brand-600">Giai Điệu</span> <br /> & Tình Yêu
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mb-10 leading-relaxed">
              Những đêm nhạc đầy cảm xúc tại các sân khấu tuyệt vời nhất Việt Nam.
            </p>
          </div>

          {/* Filters - Client Component */}
          <ShowFiltersClient locations={data.locations} total={data.meta.total} />
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        {/* Shows Grid - Server Component */}
        <Suspense
          key={JSON.stringify(searchParams)}
          fallback={<ShowsGridSkeleton count={12} />}
        >
          <ShowsGridServer shows={data.shows} />
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
