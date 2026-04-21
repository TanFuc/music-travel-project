import type { MetadataRoute } from 'next';
const env =
  (
    globalThis as {
      process?: {
        env?: Record<string, string | undefined>;
      };
    }
  ).process?.env || {};
const SITE_URL = (env.NEXT_PUBLIC_SITE_URL || 'https://maichohanhtinhxanh.com').replace(/\/$/, '');
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
          '/login',
          '/register',
          '/payment-demo',
          '/search',
          '/register-performance',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
