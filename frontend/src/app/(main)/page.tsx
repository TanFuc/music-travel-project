/**
 * Homepage - ISR (Incremental Static Regeneration)
 * Server Component with revalidation every 3 minutes
 *
 * Performance improvements:
 * - Data fetched on server at build time and cached
 * - Reduced client-side JavaScript bundle
 * - Better SEO with server-rendered content
 * - Faster Time to First Byte (TTFB)
 */

import { Suspense } from 'react';
import { HeroBannerClient } from '@/components/client/HeroBannerClient';
import { LocationFilterClient } from '@/components/client/LocationFilterClient';
import { ShowsSectionClient } from '@/components/client/ShowsSectionClient';
import { StagesSectionServer } from '@/components/server/StagesSectionServer';
import { ToursSectionServer } from '@/components/server/ToursSectionServer';
import {
  HeroBannerSkeleton,
  LocationFilterSkeleton,
  ShowsSectionSkeleton,
  StagesSectionSkeleton,
  ToursSectionSkeleton,
} from '@/components/server/Skeletons';
import { serverAPI, type Banner, type Show, type HomeStage, type Tour, type Location } from '@/lib/api-server';

// ISR - Revalidate every 3 minutes
export const revalidate = 180;

// Metadata for SEO
export const metadata = {
  title: 'Music Travel - Khám phá âm nhạc và du lịch',
  description: 'Nền tảng kết nối âm nhạc và du lịch hàng đầu Việt Nam. Khám phá show diễn, tour du lịch và sân khấu âm nhạc đẳng cấp.',
  openGraph: {
    title: 'Music Travel - Khám phá âm nhạc và du lịch',
    description: 'Nền tảng kết nối âm nhạc và du lịch hàng đầu Việt Nam',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Music Travel - Khám phá âm nhạc và du lịch',
    description: 'Nền tảng kết nối âm nhạc và du lịch hàng đầu Việt Nam',
  },
};

// Fetch all data in parallel on the server
async function fetchHomeData() {
  try {
    const [banners, showsData, stages, toursData, locations] = await Promise.all([
      serverAPI.banners.getHomeBanners().catch(() => [] as Banner[]),
      serverAPI.shows.getHomeShows().catch(() => ({ items: [] as Show[], meta: { total: 0 } })),
      serverAPI.stages.getHomeStages().catch(() => [] as HomeStage[]),
      serverAPI.tours.getHomeTours().catch(() => ({ items: [] as Tour[], meta: { total: 0 } })),
      serverAPI.locations.getAll().catch(() => [] as Location[]),
    ]);

    return {
      banners: Array.isArray(banners) ? banners : [],
      shows: showsData?.items || [],
      stages: Array.isArray(stages) ? stages : [],
      tours: toursData?.items || [],
      locations: Array.isArray(locations) ? locations : [],
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return {
      banners: [],
      shows: [],
      stages: [],
      tours: [],
      locations: [],
    };
  }
}

export default async function HomePage() {
  const data = await fetchHomeData();

  return (
    <div className="bg-gradient-to-b from-white via-brand-50/30 to-brand-100/50">
      {/* Hero Banner - Client Component for carousel interactivity */}
      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBannerClient banners={data.banners} />
      </Suspense>

      {/* Quick Location Filter - Client Component for interactivity */}
      <div className="px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LocationFilterSkeleton />}>
          <LocationFilterClient locations={data.locations} />
        </Suspense>
      </div>

      {/* Shows Section - Client Component for tabs/search interactivity */}
      <div className="lazy-section">
        <Suspense fallback={<ShowsSectionSkeleton />}>
          <ShowsSectionClient initialShows={data.shows} />
        </Suspense>
      </div>

      {/* Stages Section - Server Component (static content) */}
      <div className="lazy-section">
        <Suspense fallback={<StagesSectionSkeleton />}>
          <StagesSectionServer stages={data.stages} />
        </Suspense>
      </div>

      {/* Tours Section - Server Component (static content) */}
      <div className="lazy-section">
        <Suspense fallback={<ToursSectionSkeleton />}>
          <ToursSectionServer tours={data.tours} />
        </Suspense>
      </div>
    </div>
  );
}
