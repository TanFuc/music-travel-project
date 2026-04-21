'use client';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { SITE_URL } from '@/lib/seo';
const SEGMENT_LABELS: Record<string, string> = {
  about: 'Gioi thieu',
  shows: 'Show',
  tours: 'Tour',
  tickets: 'Ve',
  search: 'Tim kiem',
  'register-singer': 'Dang ky ca si',
  cart: 'Gio hang',
  checkout: 'Thanh toan',
  profile: 'Tai khoan',
  collaborator: 'Cong tac vien',
  dashboard: 'Bang dieu khien',
};
function toReadableLabel(segment: string): string {
  const mapped = SEGMENT_LABELS[segment];
  if (mapped) {
    return mapped;
  }
  return decodeURIComponent(segment)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
export function PublicBreadcrumbJsonLd() {
  const pathname = usePathname();
  const schema = useMemo(() => {
    if (!pathname) return null;
    const segments = pathname.split('/').filter(Boolean);
    const itemListElement = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chu',
        item: SITE_URL,
      },
      ...segments.map((segment: string, index: number) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: toReadableLabel(segment),
        item: `${SITE_URL}/${segments.slice(0, index + 1).join('/')}`,
      })),
    ];
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement,
        },
      ],
    };
  }, [pathname]);
  const hiddenPrefixes = ['/admin', '/checkout', '/cart', '/profile'];
  const hiddenExactPaths = ['/login', '/register', '/payment-demo'];
  if (
    !pathname ||
    hiddenPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    hiddenExactPaths.includes(pathname)
  ) {
    return null;
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
