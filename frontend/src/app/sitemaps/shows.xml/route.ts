import { NextResponse } from 'next/server';
import { SITE_URL, wrapInUrlSet, formatUrl, fetchAllEntitySlugs } from '@/lib/sitemap-utils';
export const dynamic = 'force-dynamic';
export const revalidate = 3600;
const BUILD_TIME = '2026-04-25T04:00:00Z';
export async function GET() {
  const shows = await Promise.race([
    fetchAllEntitySlugs('/shows?status=UPCOMING'),
    new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 8000)),
  ]);
  const content = (shows as any[])
    .filter((s) => s?.slug)
    .map((show) =>
      formatUrl({
        loc: `${SITE_URL}/shows/${show.slug}`,
        lastmod: show.updatedAt || show.createdAt || BUILD_TIME,
        changefreq: 'daily',
        priority: '0.8',
        image:
          show.thumbnailUrl && show.thumbnailUrl.startsWith('http')
            ? show.thumbnailUrl
            : `${SITE_URL}${show.thumbnailUrl}`,
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
