import { Suspense } from 'react';
import { HeroBannerClient } from '@/components/client/HeroBannerClient';
import { LocationFilterClient } from '@/components/client/LocationFilterClient';
import { ShowsSectionClient } from '@/components/client/ShowsSectionClient';
import { StagesSectionServer } from '@/components/server/StagesSectionServer';
import { ToursSectionServer } from '@/components/server/ToursSectionServer';
import { CombosSectionServer } from '@/components/server/CombosSectionServer';
import {
  HeroBannerSkeleton,
  LocationFilterSkeleton,
  ShowsSectionSkeleton,
  StagesSectionSkeleton,
  ToursSectionSkeleton,
} from '@/components/server/Skeletons';
import {
  serverAPI,
  type Banner,
  type Show,
  type HomeStage,
  type Tour,
  type Location,
} from '@/lib/api-server';
export const revalidate = 180;
export const metadata = {
  title: 'Mãi Cho Hành Tinh Xanh - Âm Nhạc, Du Lịch & Cộng Đồng',
  description:
    'Hệ sinh thái kết nối Âm nhạc đỉnh cao, Du lịch trải nghiệm Xanh và hoạt động Cộng đồng bền vững. Cùng Bizmall lan tỏa những giá trị tốt đẹp đến hành tinh.',
  openGraph: {
    title: 'Mãi Cho Hành Tinh Xanh - Âm Nhạc, Du Lịch & Cộng Đồng',
    description: 'Hệ sinh thái kết nối Âm nhạc, Du lịch Xanh và Cộng đồng bền vững.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mãi Cho Hành Tinh Xanh - Âm Nhạc, Du Lịch & Cộng Đồng',
    description: 'Hệ sinh thái kết nối Âm nhạc, Du lịch Xanh và Cộng đồng bền vững.',
  },
};
async function fetchHomeData() {
  try {
    const [banners, showsData, stages, toursData, combosData, locations] = await Promise.all([
      serverAPI.banners.getHomeBanners().catch(() => [] as Banner[]),
      serverAPI.shows.getHomeShows().catch(() => ({ items: [] as Show[], meta: { total: 0 } })),
      serverAPI.stages.getHomeStages().catch(() => [] as HomeStage[]),
      serverAPI.tours.getHomeTours().catch(() => ({ items: [] as Tour[], meta: { total: 0 } })),
      serverAPI.combos.getHomeCombos().catch(() => ({ items: [] as Tour[], meta: { total: 0 } })),
      serverAPI.locations.getAll().catch(() => [] as Location[]),
    ]);
    return {
      banners: Array.isArray(banners) ? banners : [],
      shows: showsData?.items || [],
      stages: Array.isArray(stages) ? stages : [],
      tours: toursData?.items || [],
      combos: combosData?.items || [],
      locations: Array.isArray(locations) ? locations : [],
    };
  } catch {
    return {
      banners: [],
      shows: [],
      stages: [],
      tours: [],
      combos: [],
      locations: [],
    };
  }
}
export default async function HomePage() {
  const data = await fetchHomeData();
  return (
    <div className="bg-gradient-to-b from-white via-brand-50/30 to-brand-100/50">
      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBannerClient banners={data.banners} />
      </Suspense>

      <div className="px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LocationFilterSkeleton />}>
          <LocationFilterClient locations={data.locations} />
        </Suspense>
      </div>

      <div className="lazy-section">
        <Suspense fallback={<ShowsSectionSkeleton />}>
          <ShowsSectionClient initialShows={data.shows} />
        </Suspense>
      </div>

      <div className="lazy-section">
        <Suspense fallback={<StagesSectionSkeleton />}>
          <StagesSectionServer stages={data.stages} />
        </Suspense>
      </div>

      <div className="lazy-section">
        <Suspense fallback={<ToursSectionSkeleton />}>
          <ToursSectionServer
            tours={data.tours}
            title="TOUR DU LỊCH SINH THÁI"
            subtitle="Khám phá vẻ đẹp thuần khiết của thiên nhiên Việt Nam qua những hành trình xanh được thiết kế dành riêng cho tâm hồn yêu thiên nhiên."
            icon="🏔️"
          />
        </Suspense>
      </div>

      <div className="lazy-section">
        <Suspense fallback={<ToursSectionSkeleton />}>
          <CombosSectionServer
            combos={data.combos}
            title="SIÊU COMBO ĐÊM NHẠC & TOUR"
            subtitle="Trải nghiệm Eco-Music độc bản: Sự giao hưởng giữa giai điệu âm nhạc đỉnh cao và không gian nghỉ dưỡng sinh thái đẳng cấp."
            icon="🎼"
          />
        </Suspense>
      </div>
    </div>
  );
}
