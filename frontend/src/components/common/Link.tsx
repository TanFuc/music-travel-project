import NextLink, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, forwardRef, useCallback, useState } from 'react';

// Routes that should be prefetched on hover for better UX
const PREFETCH_ON_HOVER_ROUTES = ['/shows', '/tours', '/', '/search'];

/**
 * Custom Link component with smart prefetching:
 * - Disables automatic prefetching to prevent RSC request spam
 * - Enables prefetch on hover for main navigation routes
 */
interface CustomLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  prefetch?: boolean;
  prefetchOnHover?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ prefetch = false, prefetchOnHover, onMouseEnter, href, ...props }, ref) => {
    const [shouldPrefetch, setShouldPrefetch] = useState(prefetch);

    // Determine if this route should prefetch on hover
    const hrefString = typeof href === 'string' ? href : href.pathname || '';
    const shouldPrefetchOnHover = prefetchOnHover ?? PREFETCH_ON_HOVER_ROUTES.some(route =>
      hrefString === route || hrefString.startsWith(route + '/')
    );

    const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
      if (shouldPrefetchOnHover && !shouldPrefetch) {
        setShouldPrefetch(true);
      }
      onMouseEnter?.(e);
    }, [shouldPrefetchOnHover, shouldPrefetch, onMouseEnter]);

    return (
      <NextLink
        ref={ref}
        href={href}
        prefetch={shouldPrefetch}
        onMouseEnter={handleMouseEnter}
        {...props}
      />
    );
  }
);

Link.displayName = 'Link';
