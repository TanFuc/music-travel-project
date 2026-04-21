import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { Toaster as HotToaster } from 'react-hot-toast';
import { WebVitals } from '@/components/common/WebVitals';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicBreadcrumbJsonLd } from '@/components/seo/PublicBreadcrumbJsonLd';
import { buildLanguageAlternates } from '@/lib/seo-jsonld';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://maichohanhtinhxanh.com').replace(
  /\/$/,
  ''
);
const enableEnglishHreflang = process.env.NEXT_PUBLIC_ENABLE_EN_HREFLANG === 'true';
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mai Cho Hanh Tinh Xanh',
  alternateName: 'Music Travel',
  url: SITE_URL,
  logo: `${SITE_URL}/apple-touch-icon.png`,
  description:
    'Nen tang ket noi am nhac va du lich, lan toa thong diep song xanh va phat trien ben vung.',
};
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Music Travel',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Mãi Cho Hành Tinh Xanh - Music Travel',
    template: '%s | Mãi Cho Hành Tinh Xanh',
  },
  description:
    'Sân khấu âm nhạc vì hành tinh xanh. Đặt vé show nhạc và tour du lịch hàng đầu Việt Nam.',
  keywords: [
    'music',
    'travel',
    'concert',
    'tour',
    'vietnam',
    'hành tinh xanh',
    'eco',
    'green planet',
    'show nhạc',
  ],
  alternates: buildLanguageAlternates('/', SITE_URL, enableEnglishHreflang),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Mãi Cho Hành Tinh Xanh - Music Travel',
    description:
      'Sân khấu âm nhạc vì hành tinh xanh. Đặt vé show nhạc và tour du lịch hàng đầu Việt Nam.',
    url: SITE_URL,
    siteName: 'Mãi Cho Hành Tinh Xanh',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Mãi Cho Hành Tinh Xanh - Music Travel',
    description: 'Sân khấu âm nhạc vì hành tinh xanh.',
  },
  other: {
    'dns-prefetch': '//fonts.googleapis.com',
  },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2E7D32',
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
      </head>
      <body className={`${beVietnamPro.variable} bg-white font-sans text-gray-900 antialiased`}>
        <Providers>
          <JsonLd data={[organizationSchema, websiteSchema]} />
          <PublicBreadcrumbJsonLd />
          <WebVitals />
          {children}
          <Toaster position="top-right" richColors />
          <HotToaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
