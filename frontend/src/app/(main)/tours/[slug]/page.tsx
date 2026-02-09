/**
 * Tour Detail Page - ISR (Incremental Static Regeneration)
 * Server Component with revalidation every 5 minutes
 *
 * Features:
 * - generateStaticParams to pre-render top 20 tours at build time
 * - generateMetadata for dynamic SEO
 * - Reduced client-side JavaScript bundle
 * - Better SEO with server-rendered content
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { TourDetailServer } from '@/components/server/TourDetailServer';
import { TourSchedulesClient } from '@/components/client/TourSchedulesClient';
import { TourBookingClient } from '@/components/client/TourBookingClient';
import { TourDetailSkeleton } from '@/components/server/Skeletons';
import { fetchServer } from '@/lib/api-server';

// ISR - Revalidate every 5 minutes
export const revalidate = 300;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Types
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
  branch: { id: number; name: string } | null;
  schedules: TourSchedule[];
}

// Pre-generate top 20 tours at build time
export async function generateStaticParams() {
  try {
    const response = await fetch(
      `${API_URL}/tours?limit=20&sortBy=createdAt&order=desc`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const tours = data.data || data.items || [];

    return tours.map((tour: { slug: string }) => ({
      slug: tour.slug,
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

    const thumbnailUrl = (tour.properties?.thumbnailUrl ||
      tour.properties?.bannerUrl) as string;

    return {
      title,
      description,
      openGraph: {
        title: tour.title,
        description,
        type: 'website',
        images: thumbnailUrl ? [thumbnailUrl] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: tour.title,
        description,
        images: thumbnailUrl ? [thumbnailUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Tour | Music Travel',
    };
  }
}

// Fetch tour data on server
async function fetchTourData(slug: string): Promise<TourDetail | null> {
  try {
    const tour = await fetchServer<TourDetail>(`/tours/${slug}`, {
      revalidate: 300,
      tags: [`tour-${slug}`],
    });
    return tour;
  } catch (error) {
    console.error(`Error fetching tour ${slug}:`, error);
    return null;
  }
}

export default async function TourDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const tour = await fetchTourData(params.slug);

  if (!tour) {
    notFound();
  }

  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      <Suspense fallback={<TourDetailSkeleton />}>
        {/* Hero Banner - rendered by TourDetailServer */}
        <TourDetailServer tour={tour} />

        {/* Main content and sidebar */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column - Tour Details and Schedules */}
            <div className="lg:col-span-2 space-y-8">
              {/* Schedules Section - Client Component */}
              <TourSchedulesClient
                tourId={tour.id}
                tourTitle={tour.title}
                schedules={tour.schedules}
              />
            </div>

            {/* Right Sidebar - Sticky Booking Card */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Booking Widget and Support Card - Client Component */}
                <TourBookingClient
                  tourId={tour.id}
                  tourTitle={tour.title}
                  schedules={tour.schedules}
                />
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
