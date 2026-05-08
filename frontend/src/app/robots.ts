import type { MetadataRoute } from 'next';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://maichohanhtinhxanh.com').replace(/\/$/, '');
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/profile/',
                    '/checkout',
                    '/cart',
                    '/(auth)/',
                    '/payment-demo',
                    '/api/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: ['/sitemap.xml', '/sitemaps/'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
