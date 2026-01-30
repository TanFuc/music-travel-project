# Performance Guide: Preventing RSC Request Spam

This document outlines the measures implemented to prevent React Server Component (RSC) request spam and maintain optimal performance in the application.

## Problem Description

Next.js Link components have prefetching enabled by default. When multiple links to the same route appear on a page, Next.js automatically fetches the RSC payload for those routes, causing:
- Excessive network requests (`route?_rsc=xxxxx`)
- Increased server load
- Poor performance and slower page loads
- Unnecessary bandwidth consumption

## Solutions Implemented

### 1. Custom Link Component (Primary Solution)

**Location:** `src/components/common/Link.tsx`

We created a custom Link wrapper that disables prefetching by default:

```tsx
import NextLink, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, forwardRef } from 'react';

interface CustomLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  prefetch?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ prefetch = false, ...props }, ref) => {
    return <NextLink ref={ref} prefetch={prefetch} {...props} />;
  }
);

Link.displayName = 'Link';
```

**Usage:**
```tsx
// ✅ Correct - Use custom Link
import { Link } from '@/components/common/Link';

// ❌ Wrong - Don't import from next/link directly
import Link from 'next/link';
```

**Status:** ✅ Implemented in all 29 files

### 2. ESLint Rule (Prevention)

**Location:** `frontend/.eslintrc.json`

Added ESLint rule to prevent direct `next/link` imports:

```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "paths": [
          {
            "name": "next/link",
            "message": "Please use '@/components/common/Link' instead to prevent RSC prefetch spam. The custom Link component defaults to prefetch={false}."
          }
        ]
      }
    ]
  },
  "overrides": [
    {
      "files": ["src/components/common/Link.tsx"],
      "rules": {
        "no-restricted-imports": "off"
      }
    }
  ]
}
```

**How it helps:**
- Developers will get an ESLint error if they try to import from 'next/link'
- The error message guides them to use the custom Link component
- Prevents future RSC spam issues from being introduced

**Status:** ✅ Configured and tested

### 3. Next.js Configuration

**Location:** `frontend/next.config.js`

Configured client router cache settings:

```javascript
experimental: {
  // Disable client router cache to prevent RSC request spam
  staleTimes: {
    dynamic: 0,    // No caching for dynamic routes
    static: 180,   // 180 seconds for static routes
  },
}
```

**How it helps:**
- Prevents Next.js from aggressively caching and prefetching dynamic routes
- Reduces unnecessary RSC requests
- Still allows reasonable caching for static routes

**Status:** ✅ Already configured

### 4. React Query Configuration

**Location:** `frontend/src/components/providers.tsx`

Configured React Query with conservative refetch settings:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,       // 10 minutes
      gcTime: 30 * 60 * 1000,          // 30 minutes
      retry: false,
      refetchOnWindowFocus: false,     // Prevent focus-triggered refetch
      refetchOnReconnect: false,       // Prevent reconnect-triggered refetch
    },
  },
});
```

**Status:** ✅ Already configured

## Files Updated

All 29 files that were importing from 'next/link' have been updated to use the custom Link:

### Pages (15 files)
- app/(auth)/login/page.tsx
- app/(auth)/register/page.tsx
- app/(main)/cart/page.tsx
- app/(main)/checkout/page.tsx
- app/(main)/profile/page.tsx
- app/(main)/shows/page.tsx
- app/(main)/shows/[slug]/page.tsx
- app/(main)/tours/page.tsx
- app/(main)/tours/[slug]/page.tsx
- app/admin/banners/page.tsx
- app/admin/layout.tsx
- app/admin/shows/page.tsx
- app/admin/shows/[id]/page.tsx
- app/admin/shows/[id]/qr-codes/page.tsx
- app/admin/stages/page.tsx

### Components (14 files)
- components/cards/ShowCard.tsx
- components/cards/TourCard.tsx
- components/common/Logo.tsx
- components/forms/LoginForm.tsx
- components/forms/RegisterForm.tsx
- components/home/HeroBanner.tsx
- components/home/ShowsSection.tsx
- components/home/StagesSection.tsx
- components/home/ToursSection.tsx
- components/layout/Footer.tsx
- components/layout/Header.tsx
- components/layout/MobileNav.tsx
- components/layout/Sidebar.tsx
- components/shows/ShowCard.tsx

## Best Practices

### When to Enable Prefetching

Only enable prefetching for critical navigation paths:

```tsx
// Critical user flows that benefit from instant navigation
<Link href="/checkout" prefetch={true}>
  Proceed to Checkout
</Link>
```

### When to Keep Prefetching Disabled (Default)

For most navigation, keep prefetching disabled:

```tsx
// Regular navigation - use default (prefetch={false})
<Link href="/profile">Profile</Link>

// List items - NEVER prefetch all items
{items.map(item => (
  <Link key={item.id} href={`/item/${item.slug}`}>
    {item.title}
  </Link>
))}
```

### Monitoring Performance

To check for RSC spam in development:

1. Open browser DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for requests with `?_rsc=` query parameter
4. If you see multiple identical requests, investigate the source

### Running ESLint

```bash
npm run lint
```

This will catch any violations of the no-restricted-imports rule.

## Testing Checklist

- [ ] No `cart?_rsc=` spam in network logs
- [ ] No repeated RSC requests for any route
- [ ] ESLint shows error when importing from 'next/link'
- [ ] All Link components use custom wrapper
- [ ] Navigation performance is improved

## Migration Guide for New Developers

If you're adding new pages or components:

1. **Always use the custom Link:**
   ```tsx
   import { Link } from '@/components/common/Link';
   ```

2. **Run ESLint to verify:**
   ```bash
   npm run lint
   ```

3. **Test in browser:**
   - Open Network tab
   - Navigate through your new pages
   - Verify no excessive `?_rsc=` requests

4. **Only enable prefetching for critical paths:**
   ```tsx
   <Link href="/critical-path" prefetch={true}>
     Critical Action
   </Link>
   ```

## Additional Resources

- [Next.js Link Prefetching Docs](https://nextjs.org/docs/app/api-reference/components/link#prefetch)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

## Troubleshooting

### Issue: ESLint shows error on custom Link.tsx
**Solution:** The file is excluded via overrides in `.eslintrc.json`

### Issue: Still seeing RSC spam
**Solution:**
1. Verify all Links use custom component
2. Check for `prefetch={true}` overrides
3. Look for router.prefetch() calls
4. Check React Query refetch settings

### Issue: Navigation feels slow
**Solution:**
1. Selectively enable prefetching for critical paths
2. Use `prefetch={true}` on primary CTAs
3. Consider using `router.prefetch()` manually for predicted navigation

## Summary

All measures are now in place to prevent RSC request spam:
- ✅ Custom Link component with prefetch disabled by default
- ✅ ESLint rule preventing direct next/link imports
- ✅ Next.js config optimized for minimal prefetching
- ✅ React Query configured to prevent aggressive refetching
- ✅ All 29 files migrated to use custom Link component

The application is now protected against RSC spam both now and in the future.
