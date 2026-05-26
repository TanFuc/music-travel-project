'use client';
import NextLink, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, forwardRef } from 'react';
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
