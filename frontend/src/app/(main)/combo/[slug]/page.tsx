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
import { RelatedProducts } from '@/components/common/RelatedProducts';
import {
  buildLanguageAlternates,
  buildTourOffers,
  buildTourScheduleProductsJsonLd,
} from '@/lib/seo-jsonld';
export const revalidate = 300;
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api/v1' : 'http://localhost:3001/api/v1');
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
interface ComboDetail {
  id: number;
  title: string;
  slug: string;
  duration: string | null;
  isCombo: boolean;
  description: string | null;
  properties: Record<string, unknown> | null;
  metaTitle: string | null;
  metaDescription: string | null;
  linkedShowId?: number | null;
  linkedShow?: {
    id: number;
    title: string;
    slug: string;
    thumbnailUrl?: string;
    stage?: {
      name: string;
      branch?: {
        name: string;
      };
    };
  } | null;
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
    const response = await fetch(`${API_URL}/combos?limit=20&sortBy=createdAt&order=desc`);
    if (!response.ok) return [];
    const data = await response.json();
    const combos = data.data?.items || data.items || [];
    return combos.map((c: { slug: string }) => ({ slug: c.slug }));
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
    const combo = await fetchComboData(params.slug);
    if (!combo) return { title: 'Combo Not Found | Music Travel' };
    const title = combo.metaTitle || `${combo.title} | Siêu Combo Music Travel`;
    const description =
      combo.metaDescription ||
      combo.description?.replace(/<[^>]*>/g, '').substring(0, 160) ||
      `Gói Combo Tour & Show: ${combo.title}`;
    const thumbnailUrl = (combo.properties?.thumbnailUrl ||
      combo.linkedShow?.thumbnailUrl) as string;
    return {
      title,
      description,
      alternates: buildLanguageAlternates(`/combo/${params.slug}`, SITE_URL, enableEnglishHreflang),
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${SITE_URL}/combo/${params.slug}`,
        images: thumbnailUrl ? [thumbnailUrl] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: thumbnailUrl ? [thumbnailUrl] : [],
      },
    };
  } catch {
    return { title: 'Combo | Music Travel' };
  }
}
async function fetchComboData(slug: string): Promise<ComboDetail | null> {
  try {
    const combo = await fetchServer<ComboDetail>(`/combos/${slug}`, {
      revalidate: 300,
      tags: [`combo-${slug}`],
    });
    return combo;
  } catch {
    return null;
  }
}
export default async function ComboDetailPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const combo = await fetchComboData(params.slug);
  if (!combo) {
    notFound();
  }
  const thumbnailUrl = (combo.properties?.thumbnailUrl ||
    combo.properties?.bannerUrl ||
    combo.linkedShow?.thumbnailUrl) as string | undefined;
  const parsedTicketTypes = Array.isArray((combo.properties as any)?.ticketTypes)
    ? (
        (combo.properties as any).ticketTypes as Array<{
          name?: unknown;
          price?: unknown;
        }>
      )
        .filter(
          (ticketType) =>
            typeof ticketType?.name === 'string' && typeof ticketType?.price === 'number'
        )
        .map((ticketType) => ({
          name: String(ticketType.name),
          price: Number(ticketType.price),
        }))
    : [];
  const itineraryItems: Array<{
    '@type': 'ListItem';
    position: number;
    item: {
      '@type': 'Place';
      name: string;
    };
  }> = [];
  if (combo.departureLoc)
    itineraryItems.push({
      '@type': 'ListItem',
      position: 1,
      item: { '@type': 'Place', name: combo.departureLoc.name },
    });
  if (combo.destinationLoc)
    itineraryItems.push({
      '@type': 'ListItem',
      position: itineraryItems.length + 1,
      item: { '@type': 'Place', name: combo.destinationLoc.name },
    });
  const nextSchedule =
    combo.schedules && combo.schedules.length > 0
      ? [...combo.schedules].sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )[0]
      : null;
  const comboSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: combo.title,
    description: stripHtml(combo.metaDescription || combo.description),
    image: thumbnailUrl ? [thumbnailUrl] : undefined,
    itinerary: { '@type': 'ItemList', itemListElement: itineraryItems },
    touristType: 'Leisure',
    offers: nextSchedule ? buildTourOffers([...combo.schedules], params.slug) : undefined,
    provider: { '@type': 'Organization', name: 'Mai Cho Hanh Tinh Xanh', url: SITE_URL },
    url: toAbsoluteUrl(`/combo/${params.slug}`),
  };
  const scheduleSchema = buildTourScheduleProductsJsonLd(combo, params.slug);
  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
      <JsonLd data={comboSchema} />
      <JsonLd data={scheduleSchema} />

      <Suspense fallback={<TourDetailSkeleton />}>
        <TourDetailServer
          tour={combo}
          sidebarChildren={
            <TourBookingClient
              tourId={combo.id}
              tourTitle={combo.title}
              schedules={combo.schedules}
              ticketTypes={parsedTicketTypes}
            />
          }
        >
          <TourSchedulesClient
            tourId={combo.id}
            tourTitle={combo.title}
            schedules={combo.schedules}
            ticketTypes={parsedTicketTypes}
          />
        </TourDetailServer>
      </Suspense>

      <div className="container mx-auto mt-24 px-4 sm:px-6 lg:px-8">
        <RelatedProducts currentId={combo.id} type="combo" />
      </div>
    </div>
  );
}
