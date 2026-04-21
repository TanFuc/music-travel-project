'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { APP_NAME, getTitleFromRoute, formatPageTitle } from '@/lib/constants';
export function usePageTitle(customTitle?: string | null, isLoading?: boolean): void {
  const pathname = usePathname();
  useEffect(() => {
    let title: string;
    if (isLoading) {
      title = formatPageTitle('Đang tải...');
    } else if (customTitle) {
      title = formatPageTitle(customTitle);
    } else {
      const routeTitle = getTitleFromRoute(pathname);
      title = routeTitle ? formatPageTitle(routeTitle) : APP_NAME;
    }
    document.title = title;
  }, [pathname, customTitle, isLoading]);
}
export function useStaticPageTitle(title: string): void {
  useEffect(() => {
    document.title = formatPageTitle(title);
  }, [title]);
}
