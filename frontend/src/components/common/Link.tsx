'use client';
import NextLink, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, forwardRef } from 'react';
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
interface CustomLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  prefetch?: boolean;
  prefetchOnHover?: boolean;
}
export const Link = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ prefetch = false, href, ...props }, ref) => {
    return <NextLink ref={ref} href={href} prefetch={prefetch} {...props} />;
  }
);
Link.displayName = 'Link';
