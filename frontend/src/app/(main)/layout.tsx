import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import FloatingContactButtons from '@/components/common/FloatingContactButtons';
import SmartSupportWidget from '@/components/common/SmartSupportWidget';
function PageSkeleton() {
  return (
    <div className="container mx-auto animate-pulse px-4 py-8">
      <div className="mb-6 h-8 w-48 rounded bg-neutral-200" />
      <div className="space-y-4">
        <div className="h-4 w-full rounded bg-neutral-100" />
        <div className="h-4 w-3/4 rounded bg-neutral-100" />
        <div className="h-4 w-5/6 rounded bg-neutral-100" />
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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
      </main>
      <Footer />
      <FloatingContactButtons />
      <SmartSupportWidget />
    </div>
  );
}
