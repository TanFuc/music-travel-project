import { NextResponse } from 'next/server';
import { SITE_URL, wrapInUrlSet, formatUrl } from '@/lib/sitemap-utils';
export const dynamic = 'force-static';
export const revalidate = 86400;
const BUILD_TIME = '2026-04-25T04:00:00Z';
export async function GET() {
  const staticRoutes = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily', lastmod: BUILD_TIME },
    { loc: `${SITE_URL}/about`, priority: '0.6', changefreq: 'monthly', lastmod: BUILD_TIME },
    { loc: `${SITE_URL}/shows`, priority: '0.9', changefreq: 'daily', lastmod: BUILD_TIME },
    { loc: `${SITE_URL}/tours`, priority: '0.9', changefreq: 'daily', lastmod: BUILD_TIME },
    { loc: `${SITE_URL}/combo`, priority: '0.9', changefreq: 'daily', lastmod: BUILD_TIME },
    { loc: `${SITE_URL}/partners`, priority: '0.7', changefreq: 'weekly', lastmod: BUILD_TIME },
    {
      loc: `${SITE_URL}/register-tour`,
      priority: '0.5',
      changefreq: 'monthly',
      lastmod: BUILD_TIME,
    },
    {
      loc: `${SITE_URL}/register-singer`,
      priority: '0.5',
      changefreq: 'monthly',
      lastmod: BUILD_TIME,
    },
    { loc: `${SITE_URL}/tickets`, priority: '0.7', changefreq: 'daily', lastmod: BUILD_TIME },
  ];
  const content = staticRoutes.map((r) => formatUrl(r)).join('\n');
  return new NextResponse(wrapInUrlSet(content), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
