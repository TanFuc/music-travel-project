'use client';

import NextLink, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, forwardRef, useCallback, useState } from 'react';

// Routes that should be prefetched on hover for better UX
const PREFETCH_ON_HOVER_ROUTES = [
  '/shows',
  '/tours',
  '/',
  '/search',
  '/cart',
  '/admin/dashboard',
  '/admin/shows',
  '/admin/users',
  '/admin/stages',
  '/admin/bookings',
];

/**
 * Custom Link component with smart prefetching:
 * - Disables automatic prefetching to prevent RSC request spam
 * - Enables prefetch on hover for main navigation routes
 * - Uses viewport intersection for critical routes
 */
interface CustomLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  prefetch?: boolean;
  prefetchOnHover?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ prefetch = false, prefetchOnHover, onMouseEnter, onFocus, href, ...props }, ref) => {
    const [shouldPrefetch, setShouldPrefetch] = useState(prefetch);

    // Determine if this route should prefetch on hover
    const hrefString = typeof href === 'string' ? href : href.pathname || '';
    const shouldPrefetchOnHover = prefetchOnHover ?? PREFETCH_ON_HOVER_ROUTES.some(route =>
      hrefString === route || hrefString.startsWith(route + '/')
    );

    const triggerPrefetch = useCallback(() => {
      if (shouldPrefetchOnHover && !shouldPrefetch) {
        setShouldPrefetch(true);
      }
    }, [shouldPrefetchOnHover, shouldPrefetch]);

    const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
      triggerPrefetch();
      onMouseEnter?.(e);
    }, [triggerPrefetch, onMouseEnter]);

    // Also prefetch on focus for keyboard navigation
    const handleFocus = useCallback((e: React.FocusEvent<HTMLAnchorElement>) => {
      triggerPrefetch();
      onFocus?.(e);
    }, [triggerPrefetch, onFocus]);

    return (
      <NextLink
        ref={ref}
        href={href}
        prefetch={shouldPrefetch}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        {...props}
      />
    );
  }
);

Link.displayName = 'Link';
