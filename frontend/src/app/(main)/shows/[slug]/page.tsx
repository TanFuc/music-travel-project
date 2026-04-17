/**
 * Show Detail Page - ISR (Incremental Static Regeneration)
 * Server Component with revalidation every 5 minutes
 *
 * Features:
 * - generateStaticParams to pre-render top 20 shows at build time
 * - generateMetadata for dynamic SEO
 * - Reduced client-side JavaScript bundle
 * - Better SEO with server-rendered content
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ShowDetailServer, ShowHero } from '@/components/server/ShowDetailServer';
import { TicketBookingClient } from '@/components/client/TicketBookingClient';
import { ShowDetailSkeleton } from '@/components/server/Skeletons';
import { fetchServer } from '@/lib/api-server';
import { JsonLd } from '@/components/seo/JsonLd';
import { stripHtml, toAbsoluteUrl } from '@/lib/seo';
import {
  buildLanguageAlternates,
  buildShowOffers,
  buildShowTicketProductsJsonLd,
} from '@/lib/seo-jsonld';

// ISR - Revalidate every 5 minutes
export const revalidate = 300;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://musictravel.vn').replace(/\/$/, '');
const enableEnglishHreflang = process.env.NEXT_PUBLIC_ENABLE_EN_HREFLANG === 'true';

// Types
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
  branch: { id: number; name: string } | null;
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

// Pre-generate top 20 shows at build time
export async function generateStaticParams() {
  try {
    const response = await fetch(`${API_URL}/shows?limit=20&status=UPCOMING&sortBy=performTime&order=asc`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const shows = data.data || data.items || [];

    return shows.map((show: { slug: string }) => ({
      slug: show.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
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
  } catch (error) {
    return {
      title: 'Show | Music Travel',
    };
  }
}

// Fetch show data on server
async function fetchShowData(slug: string): Promise<ShowDetail | null> {
  try {
    const show = await fetchServer<ShowDetail>(`/shows/${slug}`, {
      revalidate: 300,
      tags: [`show-${slug}`],
    });
    return show;
  } catch (error) {
    console.error(`Error fetching show ${slug}:`, error);
    return null;
  }
}

export default async function ShowDetailPage({
  params,
}: {
  params: { slug: string };
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
    eventStatus: show.status === 'UPCOMING'
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
    offers: minPrice !== undefined
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
    <div className="bg-neutral-50 min-h-screen pb-20">
      <JsonLd data={showSchema} />
      <JsonLd data={showTicketProductsSchema} />
      <Suspense fallback={<ShowDetailSkeleton />}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Banner */}
          <ShowHero show={show} />
        </div>

        {/* Re-structure: Main content and sidebar */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column - Show Details */}
            <div className="lg:col-span-2 space-y-8">
              <ShowDetailServer show={show} />
            </div>

            {/* Right Sidebar - Sticky Booking Card */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Booking Card - Client Component */}
                <TicketBookingClient
                  showId={show.id}
                  showTitle={show.title}
                  ticketClasses={show.ticketClasses}
                  isBookable={isBookable}
                />

                {/* Need Help? */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 text-center">
                  <p className="font-bold text-gray-900 mb-2">Bạn cần hỗ trợ?</p>
                  <p className="text-sm text-neutral-500 mb-4">
                    Liên hệ với chúng tôi để được tư vấn thêm về show diễn
                  </p>
                  <a
                    href="tel:0912946549"
                    className="text-brand-600 font-bold text-lg hover:underline"
                  >
                    0912 946 549
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
