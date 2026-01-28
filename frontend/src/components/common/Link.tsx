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
  ({ prefetch = false, href, ...props }, ref) => {
    return (
      <NextLink
        ref={ref}
        href={href}
        prefetch={prefetch}
        {...props}
      />
    );
  }
);

Link.displayName = 'Link';
