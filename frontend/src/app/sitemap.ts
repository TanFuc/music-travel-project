import type { MetadataRoute } from 'next';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
const env = (globalThis as {
    process?: {
        env?: Record<string, string | undefined>;
    };
}).process?.env || {};
const SITE_URL = (env.NEXT_PUBLIC_SITE_URL || 'https://maichohanhtinhxanh.com').replace(/\/$/, '');
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
    isCombo?: boolean;
};
type StaticRouteConfig = {
    path: string;
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
    priority: number;
};
async function fetchItems(path: string): Promise<SitemapItem[]> {
    try {
        const fetchOptions: NextFetchOptions = {
            cache: 'no-store',
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
    }
    catch {
        return [];
    }
}
function resolveLastModified(item?: SitemapItem): Date {
    const candidate = item?.updatedAt || item?.performTime || item?.startDate || item?.createdAt;
    const parsed = candidate ? new Date(candidate) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}
function getCollectionLastModified(items: SitemapItem[]): Date {
    if (items.length === 0) {
        return new Date();
    }
    const latestTimestamp = items
        .map((item) => resolveLastModified(item).getTime())
        .reduce((latest, current) => (current > latest ? current : latest), 0);
    return latestTimestamp > 0 ? new Date(latestTimestamp) : new Date();
}
function uniqueBySlug(items: SitemapItem[]): SitemapItem[] {
    const seen = new Set<string>();
    return items.filter((item) => {
        const slug = item.slug.trim();
        if (!slug || seen.has(slug)) {
            return false;
        }
        seen.add(slug);
        return true;
    });
}
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [showItems, tourItems] = await Promise.all([
        fetchItems('/shows?status=UPCOMING&limit=1000&page=1'),
        fetchItems('/tours?limit=1000&page=1'),
    ]);
    const shows = uniqueBySlug(showItems);
    const tours = uniqueBySlug(tourItems);
    const staticRouteConfigs: StaticRouteConfig[] = [
        { path: '/', changeFrequency: 'daily', priority: 1 },
        { path: '/shows', changeFrequency: 'hourly', priority: 0.95 },
        { path: '/tours', changeFrequency: 'daily', priority: 0.9 },
        { path: '/combo', changeFrequency: 'daily', priority: 0.9 },
        { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
        { path: '/tickets', changeFrequency: 'daily', priority: 0.7 },
        { path: '/register-singer', changeFrequency: 'weekly', priority: 0.6 },
    ];
    const showsLastModified = getCollectionLastModified(shows);
    const toursLastModified = getCollectionLastModified(tours);
    const staticRoutes: MetadataRoute.Sitemap = staticRouteConfigs.map((route) => ({
        url: `${SITE_URL}${route.path}`,
        lastModified: route.path === '/shows'
            ? showsLastModified
            : route.path === '/tours'
                ? toursLastModified
                : new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));
    const showRoutes: MetadataRoute.Sitemap = shows.map((show) => ({
        url: `${SITE_URL}/shows/${show.slug}`,
        lastModified: resolveLastModified(show),
        changeFrequency: 'daily',
        priority: 0.88,
    }));
    const comboRoutes: MetadataRoute.Sitemap = tours.filter((t) => t.isCombo).map((combo) => ({
        url: `${SITE_URL}/combo/${combo.slug}`,
        lastModified: resolveLastModified(combo),
        changeFrequency: 'daily',
        priority: 0.85,
    }));
    const tourRoutes: MetadataRoute.Sitemap = tours.filter((t) => !t.isCombo).map((tour) => ({
        url: `${SITE_URL}/tours/${tour.slug}`,
        lastModified: resolveLastModified(tour),
        changeFrequency: 'daily',
        priority: 0.85,
    }));
    return [...staticRoutes, ...showRoutes, ...comboRoutes, ...tourRoutes];
}
