import type { MetadataRoute } from 'next';

export const revalidate = 3600;

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env || {};
const SITE_URL = (env.NEXT_PUBLIC_SITE_URL || 'https://musictravel.vn').replace(/\/$/, '');
const API_URL = (env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace(/\/$/, '');

type NextFetchOptions = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

type SitemapItem = {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
  performTime?: string;
  startDate?: string;
};

async function fetchItems(path: string): Promise<SitemapItem[]> {
  try {
    const fetchOptions: NextFetchOptions = {
      next: { revalidate },
    };

    const response = await fetch(`${API_URL}${path}`, fetchOptions);

    if (!response.ok) {
      return [];
    }

    const body = await response.json();
    const rawItems = body?.data?.items || body?.data || body?.items || [];

    if (!Array.isArray(rawItems)) {
      return [];
    }

    return rawItems.filter((item) => item && typeof item.slug === 'string');
  } catch {
    return [];
  }
}

function resolveLastModified(item?: SitemapItem): Date {
  const candidate = item?.updatedAt || item?.performTime || item?.startDate || item?.createdAt;
  const parsed = candidate ? new Date(candidate) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [shows, tours] = await Promise.all([
    fetchItems('/shows?status=UPCOMING&limit=1000&page=1'),
    fetchItems('/tours?limit=1000&page=1'),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/shows`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/tours`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/tickets`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/register-singer`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  const showRoutes: MetadataRoute.Sitemap = shows.map((show) => ({
    url: `${SITE_URL}/shows/${show.slug}`,
    lastModified: resolveLastModified(show),
    changeFrequency: 'daily',
    priority: 0.88,
  }));

  const tourRoutes: MetadataRoute.Sitemap = tours.map((tour) => ({
    url: `${SITE_URL}/tours/${tour.slug}`,
    lastModified: resolveLastModified(tour),
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  return [...staticRoutes, ...showRoutes, ...tourRoutes];
}
