import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ShowDetailServer, ShowHero } from '@/components/server/ShowDetailServer';
import { TicketBookingClient } from '@/components/client/TicketBookingClient';
import { ShowDetailSkeleton } from '@/components/server/Skeletons';
import { fetchServer } from '@/lib/api-server';
import { JsonLd } from '@/components/seo/JsonLd';
import { stripHtml, toAbsoluteUrl } from '@/lib/seo';
import { RelatedProducts } from '@/components/common/RelatedProducts';
import {
  buildLanguageAlternates,
  buildShowOffers,
  buildShowTicketProductsJsonLd,
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
interface Artist {
  id: number;
  name: string;
  bio: string | null;
  socialLinks: Record<string, string> | null;
  isHeadline: boolean;
}
interface TicketClass {
  id: number;
  name: string;
  price: number;
  colorCode: string | null;
  availableCount: number;
}
interface ShowDetail {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  performTime: string;
  checkInTime: string | null;
  thumbnailUrl?: string | null;
  status: string;
  branch: {
    id: number;
    name: string;
  } | null;
  seatSelectionEnabled: boolean;
  properties: Record<string, unknown> | null;
  metaTitle: string | null;
  metaDescription: string | null;
  stage: {
    id: number;
    name: string;
    address: string | null;
    mapLink: string | null;
    latitude?: number;
    longitude?: number;
    location: {
      id: number;
      name: string;
    };
  };
  artists: Artist[];
  ticketClasses: TicketClass[];
}
export async function generateStaticParams() {
  try {
    const response = await fetch(
      `${API_URL}/shows?limit=20&status=UPCOMING&sortBy=performTime&order=asc`
    );
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    const shows = data.data || data.items || [];
    return shows.map((show: { slug: string }) => ({
      slug: show.slug,
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
    const show = await fetchShowData(params.slug);
    if (!show) {
      return {
        title: 'Show Not Found | Music Travel',
      };
    }
    const title = show.metaTitle || `${show.title} | Music Travel`;
    const description =
      show.metaDescription ||
      show.description?.replace(/<[^>]*>/g, '').substring(0, 160) ||
      `Tham gia ${show.title} tại ${show.stage.name}`;
    const ogImageUrl = `${SITE_URL}/shows/${params.slug}/opengraph-image`;
    return {
      title,
      description,
      alternates: buildLanguageAlternates(`/shows/${params.slug}`, SITE_URL, enableEnglishHreflang),
      openGraph: {
        title: show.title,
        description,
        type: 'website',
        url: `${SITE_URL}/shows/${params.slug}`,
        images: [ogImageUrl, ...(show.thumbnailUrl ? [show.thumbnailUrl] : [])],
      },
      twitter: {
        card: 'summary_large_image',
        title: show.title,
        description,
        images: [ogImageUrl, ...(show.thumbnailUrl ? [show.thumbnailUrl] : [])],
      },
    };
  } catch {
    return {
      title: 'Show | Music Travel',
    };
  }
}
async function fetchShowData(slug: string): Promise<ShowDetail | null> {
  try {
    const show = await fetchServer<ShowDetail>(`/shows/${slug}`, {
      revalidate: 300,
      tags: [`show-${slug}`],
    });
    return show;
  } catch {
    return null;
  }
}
export default async function ShowDetailPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const show = await fetchShowData(params.slug);
  if (!show) {
    notFound();
  }
  const isBookable = show.status === 'UPCOMING' || show.status === 'ONGOING';
  const minPrice = show.ticketClasses.length
    ? Math.min(...show.ticketClasses.map((ticketClass) => ticketClass.price))
    : undefined;
  const maxPrice = show.ticketClasses.length
    ? Math.max(...show.ticketClasses.map((ticketClass) => ticketClass.price))
    : undefined;
  const showSchema = {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: show.title,
    description: stripHtml(show.metaDescription || show.description),
    image: show.thumbnailUrl ? [show.thumbnailUrl] : undefined,
    eventStatus:
      show.status === 'UPCOMING'
        ? 'https://schema.org/EventScheduled'
        : show.status === 'ONGOING'
          ? 'https://schema.org/EventInProgress'
          : 'https://schema.org/EventCompleted',
    startDate: show.performTime,
    location: {
      '@type': 'Place',
      name: show.stage.name,
      address: show.stage.address || show.stage.location.name,
    },
    performer: show.artists.map((artist) => ({
      '@type': 'Person',
      name: artist.name,
    })),
    offers:
      minPrice !== undefined
        ? [
            {
              '@type': 'AggregateOffer',
              priceCurrency: 'VND',
              lowPrice: minPrice,
              highPrice: maxPrice,
              offerCount: show.ticketClasses.length,
              availability: isBookable
                ? 'https://schema.org/InStock'
                : 'https://schema.org/SoldOut',
              url: toAbsoluteUrl(`/shows/${params.slug}`),
            },
            ...buildShowOffers(show.ticketClasses, isBookable, params.slug),
          ]
        : undefined,
    organizer: {
      '@type': 'Organization',
      name: 'Mai Cho Hanh Tinh Xanh',
      url: SITE_URL,
    },
    url: toAbsoluteUrl(`/shows/${params.slug}`),
  };
  const showTicketProductsSchema = buildShowTicketProductsJsonLd(show, params.slug, isBookable);
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <JsonLd data={showSchema} />
      <JsonLd data={showTicketProductsSchema} />
      <Suspense fallback={<ShowDetailSkeleton />}>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <ShowHero show={show} />
        </div>

        <div className="container relative z-10 mx-auto -mt-20 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <ShowDetailServer show={show} />
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <div className="space-y-6">
                  <TicketBookingClient
                    showId={show.id}
                    showTitle={show.title}
                    ticketClasses={show.ticketClasses}
                    isBookable={isBookable}
                  />

                  <div className="rounded-2xl border border-neutral-100 bg-white p-6 text-center shadow-sm">
                    <p className="mb-2 font-bold text-gray-900">Bạn cần hỗ trợ?</p>
                    <p className="mb-4 text-sm text-neutral-500">
                      Liên hệ với chúng tôi để được tư vấn thêm về show diễn
                    </p>
                    <a
                      href="tel:0912946549"
                      className="text-lg font-bold text-brand-600 hover:underline"
                    >
                      0912 946 549
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto mt-24 px-4 sm:px-6 lg:px-8">
          <RelatedProducts currentId={show.id} type="show" />
        </div>
      </Suspense>
    </div>
  );
}
