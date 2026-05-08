import { NextResponse } from 'next/server';
import { SITE_URL, wrapInUrlSet, formatUrl, fetchAllEntitySlugs } from '@/lib/sitemap-utils';
export const dynamic = 'force-dynamic';
export const revalidate = 3600;
const BUILD_TIME = '2026-04-25T04:00:00Z';
export async function GET() {
  const tours = await Promise.race([
    fetchAllEntitySlugs('/tours'),
    new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 8000)),
  ]);
  const content = (tours as any[])
    .filter((t) => t?.slug)
    .map((tour) =>
      formatUrl({
        loc: `${SITE_URL}/tours/${tour.slug}`,
        lastmod: tour.updatedAt || tour.createdAt || BUILD_TIME,
        changefreq: 'weekly',
        priority: tour.isCombo ? '0.8' : '0.7',
        image:
          tour.thumbnailUrl && tour.thumbnailUrl.startsWith('http')
            ? tour.thumbnailUrl
            : `${SITE_URL}${tour.thumbnailUrl}`,
      })
    )
    .join('\n');
  return new NextResponse(wrapInUrlSet(content || ''), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
