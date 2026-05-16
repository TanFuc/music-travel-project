import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchServer } from '@/lib/api-server';
interface StaticPage {
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}
export async function generateMetadata({
  params,
}: {
  params: {
    slug: string;
  };
}): Promise<Metadata> {
  try {
    const page = await fetchServer<StaticPage>(`/static-pages/slug/${params.slug}`);
    return {
      title: page.metaTitle || `${page.title} | Mãi Cho Hành Tinh Xanh`,
      description: page.metaDescription,
    };
  } catch {
    return { title: 'Trang không tìm thấy' };
  }
}
export default async function StaticPageViewPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  let page;
  try {
    page = await fetchServer<StaticPage>(`/static-pages/slug/${params.slug}`);
  } catch (error) {
    notFound();
  }
  return (
    <main className="min-h-screen bg-[#FDFDFF] pb-20 pt-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 flex items-center gap-4">
            <div className="h-12 w-1.5 rounded-full bg-brand-500" />
            <h1 className="font-display text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              {page.title}
            </h1>
          </div>

          <div className="rounded-[40px] border border-brand-100 bg-white p-8 shadow-sm sm:p-12">
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: page.content }} />
          </div>
        </div>
      </div>
    </main>
  );
}
