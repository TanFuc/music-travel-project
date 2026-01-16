import NextLink, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, forwardRef } from 'react';

/**
 * Custom Link component that disables prefetching by default
 * to prevent RSC request spam issues
 */
interface CustomLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  prefetch?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ prefetch = false, ...props }, ref) => {
    return <NextLink ref={ref} prefetch={prefetch} {...props} />;
  }
);

Link.displayName = 'Link';
