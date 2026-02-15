import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import FloatingContactButtons from '@/components/common/FloatingContactButtons';
import SmartSupportWidget from '@/components/common/SmartSupportWidget';

// Loading skeleton for page content
function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 w-48 bg-neutral-200 rounded mb-6" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-neutral-100 rounded" />
        <div className="h-4 w-3/4 bg-neutral-100 rounded" />
        <div className="h-4 w-5/6 bg-neutral-100 rounded" />
      </div>
    </div>
  );
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <Suspense fallback={<PageSkeleton />}>
          {children}
        </Suspense>
      </main>
      <Footer />
      <FloatingContactButtons />
      <SmartSupportWidget />
    </div>
  );
}
