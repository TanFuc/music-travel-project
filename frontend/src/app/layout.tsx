import type { Metadata } from 'next';
import { Inter, Outfit, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layout/Header';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: {
    default: 'Music Travel - Đặt Vé Show Nhạc & Tour Du Lịch',
    template: '%s | Music Travel',
  },
  description: 'Sân khấu âm nhạc nơi giai điệu sống được cất lên. Đặt vé show nhạc và tour du lịch hàng đầu Việt Nam.',
  keywords: ['booking', 'music', 'travel', 'concert', 'tour', 'vietnam', 'show nhạc', 'đà lạt', 'mây lang thang'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${spaceGrotesk.variable} font-sans antialiased bg-dark text-white`}>
        <Providers>
          <Header />
          <main>{children}</main>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
