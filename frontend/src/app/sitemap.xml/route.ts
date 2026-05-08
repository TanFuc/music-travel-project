import { NextResponse } from 'next/server';
import { SITE_URL, wrapInSitemapIndex } from '@/lib/sitemap-utils';
export const dynamic = 'force-static';
export const revalidate = 86400;
const BUILD_TIME = '2026-04-25T04:00:00Z';
export async function GET() {
  const content = [
    { loc: `${SITE_URL}/sitemaps/static.xml`, lastmod: BUILD_TIME },
    { loc: `${SITE_URL}/sitemaps/tours.xml`, lastmod: BUILD_TIME },
    { loc: `${SITE_URL}/sitemaps/shows.xml`, lastmod: BUILD_TIME },
  ]
    .map(
      (s) =>
        `  <sitemap>\n    <loc>${s.loc}</loc>\n    <lastmod>${s.lastmod}</lastmod>\n  </sitemap>`
    )
    .join('\n');
  return new NextResponse(wrapInSitemapIndex(content), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      'X-Robots-Tag': 'noindex',
    },
  });
}
