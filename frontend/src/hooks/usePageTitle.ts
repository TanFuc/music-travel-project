'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { APP_NAME, getTitleFromRoute, formatPageTitle } from '@/lib/constants';

/**
 * Hook to dynamically update the document title based on the current route.
 *
 * @param customTitle - Optional custom title to use instead of route-based title.
 *                      Useful for dynamic pages where title depends on fetched data.
 * @param isLoading - Optional loading state. When true, shows a loading indicator in title.
 *
 * @example
 * // Basic usage - auto-detects title from route
 * usePageTitle();
 *
 * @example
 * // With custom title for dynamic content
 * usePageTitle(show?.title);
 *
 * @example
 * // With loading state
 * usePageTitle(show?.title, isLoading);
 */
export function usePageTitle(customTitle?: string | null, isLoading?: boolean): void {
  const pathname = usePathname();

  useEffect(() => {
    let title: string;

    if (isLoading) {
      // Show loading state
      title = formatPageTitle('Đang tải...');
    } else if (customTitle) {
      // Use custom title (for dynamic pages with data)
      title = formatPageTitle(customTitle);
    } else {
      // Get title from route mapping
      const routeTitle = getTitleFromRoute(pathname);
      title = routeTitle ? formatPageTitle(routeTitle) : APP_NAME;
    }

    document.title = title;
  }, [pathname, customTitle, isLoading]);
}

/**
 * Hook specifically for setting a static page title.
 * Use this when you know the exact title upfront.
 *
 * @param title - The page title to set
 *
 * @example
 * useStaticPageTitle('Đăng Nhập');
 */
export function useStaticPageTitle(title: string): void {
  useEffect(() => {
    document.title = formatPageTitle(title);
  }, [title]);
}
