import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { Toaster as HotToaster } from 'react-hot-toast';
import { WebVitals } from '@/components/common/WebVitals';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'], // Reduced from 9 weights to 4 for faster loading
  variable: '--font-be-vietnam',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: {
    default: 'Mãi Cho Hành Tinh Xanh - Music Travel',
    template: '%s | Mãi Cho Hành Tinh Xanh',
  },
  description: 'Sân khấu âm nhạc vì hành tinh xanh. Đặt vé show nhạc và tour du lịch hàng đầu Việt Nam.',
  keywords: ['music', 'travel', 'concert', 'tour', 'vietnam', 'hành tinh xanh', 'eco', 'green planet', 'show nhạc'],

  // Favicon configuration - generated from logo via favicon.io
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

  // Open Graph for social sharing
  openGraph: {
    title: 'Mãi Cho Hành Tinh Xanh - Music Travel',
    description: 'Sân khấu âm nhạc vì hành tinh xanh. Đặt vé show nhạc và tour du lịch hàng đầu Việt Nam.',
    url: 'https://musictravel.vn',
    siteName: 'Mãi Cho Hành Tinh Xanh',
    locale: 'vi_VN',
    type: 'website',
  },

  // Twitter card
  twitter: {
    card: 'summary',
    title: 'Mãi Cho Hành Tinh Xanh - Music Travel',
    description: 'Sân khấu âm nhạc vì hành tinh xanh.',
  },

  // Other optimizations
  other: {
    'dns-prefetch': '//fonts.googleapis.com',
  },
};

// Viewport configuration for mobile optimization
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2E7D32', // Green to match eco logo
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Preconnect to external origins for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
      </head>
      <body className={`${beVietnamPro.variable} font-sans antialiased bg-white text-gray-900`}>
        <Providers>
          <WebVitals />
          {children}
          <Toaster position="top-right" richColors />
          <HotToaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
