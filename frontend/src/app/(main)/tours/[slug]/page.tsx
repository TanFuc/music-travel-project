import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { TourDetailServer } from '@/components/server/TourDetailServer';
import { TourSchedulesClient } from '@/components/client/TourSchedulesClient';
import { TourBookingClient } from '@/components/client/TourBookingClient';
import { TourDetailSkeleton } from '@/components/server/Skeletons';
import { fetchServer } from '@/lib/api-server';
import { JsonLd } from '@/components/seo/JsonLd';
import { stripHtml, toAbsoluteUrl } from '@/lib/seo';
import {
  buildLanguageAlternates,
  buildTourOffers,
  buildTourScheduleProductsJsonLd,
} from '@/lib/seo-jsonld';
export const revalidate = 300;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2222/api/v1';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://maichohanhtinhxanh.com').replace(
  /\/$/,
  ''
);
const enableEnglishHreflang = process.env.NEXT_PUBLIC_ENABLE_EN_HREFLANG === 'true';
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
  metaTitle: string | null;
  metaDescription: string | null;
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
export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_URL}/tours?limit=20&sortBy=createdAt&order=desc`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    const tours = data.data || data.items || [];
    return tours.map((tour: { slug: string }) => ({
      slug: tour.slug,
    }));
  } catch {
    return [];
  }
}
export async function generateMetadata({
  params,
}: {
  params: {
    slug: string;
  };
}): Promise<Metadata> {
  try {
    const tour = await fetchTourData(params.slug);
    if (!tour) {
      return {
        title: 'Tour Not Found | Music Travel',
      };
    }
    const title = tour.metaTitle || `${tour.title} | Music Travel`;
    const description =
      tour.metaDescription ||
      tour.description?.replace(/<[^>]*>/g, '').substring(0, 160) ||
      `Khám phá ${tour.title} cùng Music Travel`;
    const ogImageUrl = `${SITE_URL}/tours/${params.slug}/opengraph-image`;
    const thumbnailUrl = (tour.properties?.thumbnailUrl || tour.properties?.bannerUrl) as string;
    return {
      title,
      description,
      alternates: buildLanguageAlternates(`/tours/${params.slug}`, SITE_URL, enableEnglishHreflang),
      openGraph: {
        title: tour.title,
        description,
        type: 'website',
        url: `${SITE_URL}/tours/${params.slug}`,
        images: [ogImageUrl, ...(thumbnailUrl ? [thumbnailUrl] : [])],
      },
      twitter: {
        card: 'summary_large_image',
        title: tour.title,
        description,
        images: [ogImageUrl, ...(thumbnailUrl ? [thumbnailUrl] : [])],
      },
    };
  } catch {
    return {
      title: 'Tour | Music Travel',
    };
  }
}
async function fetchTourData(slug: string): Promise<TourDetail | null> {
  try {
    const tour = await fetchServer<TourDetail>(`/tours/${slug}`, {
      revalidate: 300,
      tags: [`tour-${slug}`],
    });
    return tour;
  } catch {
    return null;
  }
}
export default async function TourDetailPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const tour = await fetchTourData(params.slug);
  if (!tour) {
    notFound();
  }
  const nextSchedule = tour.schedules
    .filter((schedule) => schedule.status === 'OPEN')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
  const thumbnailUrl = (tour.properties?.thumbnailUrl || tour.properties?.bannerUrl) as
    | string
    | undefined;
  const hasSlots = nextSchedule ? nextSchedule.capacity - nextSchedule.bookedCount > 0 : false;
  const itineraryItems: Array<{
    '@type': 'ListItem';
    position: number;
    item: {
      '@type': 'Place';
      name: string;
    };
  }> = [];
  if (tour.departureLoc) {
    itineraryItems.push({
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Place',
        name: tour.departureLoc.name,
      },
    });
  }
  if (tour.destinationLoc) {
    itineraryItems.push({
      '@type': 'ListItem',
      position: itineraryItems.length + 1,
      item: {
        '@type': 'Place',
        name: tour.destinationLoc.name,
      },
    });
  }
  const tourSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: stripHtml(tour.metaDescription || tour.description),
    image: thumbnailUrl ? [thumbnailUrl] : undefined,
    itinerary: {
      '@type': 'ItemList',
      itemListElement: itineraryItems,
    },
    touristType: 'Leisure',
    offers: nextSchedule ? buildTourOffers([...tour.schedules], params.slug) : undefined,
    provider: {
      '@type': 'Organization',
      name: 'Mai Cho Hanh Tinh Xanh',
      url: SITE_URL,
    },
    url: toAbsoluteUrl(`/tours/${params.slug}`),
  };
  const tourScheduleProductsSchema = buildTourScheduleProductsJsonLd(tour, params.slug);
  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
      <JsonLd data={tourSchema} />
      <JsonLd data={tourScheduleProductsSchema} />

      <Suspense fallback={<TourDetailSkeleton />}>
        <TourDetailServer
          tour={tour}
          sidebarChildren={
            <TourBookingClient tourId={tour.id} tourTitle={tour.title} schedules={tour.schedules} />
          }
        >
          <TourSchedulesClient tourId={tour.id} tourTitle={tour.title} schedules={tour.schedules} />
        </TourDetailServer>
      </Suspense>
    </div>
  );
}
