# Next.js Performance Optimization - Analysis & Solutions

## 🔍 Current Issues

Based on logs, compilation times are very slow:
- Initial routes: 4-26 seconds
- Subsequent routes: 0.5-6 seconds  
- Total modules: 1100+ per route
- Hot reload: 1-18 seconds

## 📊 Diagnostic Checklist

### 1. Check Bundle Size & Module Count
```bash
npm run build
# Check .next/build-manifest.json for chunk sizes
```

**Expected**: <500 modules per route, <200KB initial chunks

### 2. Analyze Import Patterns
Run this search to find problematic imports:

```bash
# Check for barrel exports (index.ts files)
grep -r "export \* from" src/

# Check for large re-exports
grep -r "export {" src/components/ui/
```

**Common Issues**:
- ❌ `import { Button } from '@/components/ui'` (barrel export)
- ✅ `import { Button } from '@/components/ui/button'` (direct import)

### 3. Check SWC Configuration
Verify `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure SWC is enabled (default in Next.js 12+)
  swcMinify: true,
  
  // Add these for better dev performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@tanstack/react-query',
    ],
  },
  
  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
}
```

### 4. TypeScript Performance
Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "incremental": true,
    "skipLibCheck": true,
    "skipDefaultLibCheck": true
  },
  "exclude": ["node_modules", ".next"]
}
```

### 5. Dependency Audit
```bash
# Check bundle impact
npx webpack-bundle-analyzer .next/server/webpack-stats.json

# Check for duplicate dependencies
npm ls react
npm ls @radix-ui/react-dialog
```

## 🚀 Optimization Solutions (Priority Order)

### HIGH PRIORITY (Immediate Impact)

#### 1. Fix Lucide React Imports
**Problem**: Importing entire icon library on every page

**Current** (❌):
```typescript
import { Users, Music, MapPin, ShoppingBag, TrendingUp } from 'lucide-react';
```

**Solution** (✅):
Add to `next.config.js`:
```javascript
modularizeImports: {
  'lucide-react': {
    transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
  },
},
```

**Expected Impact**: -30% compile time, -200 modules per page

#### 2. Optimize Package Imports
Add to `next.config.js`:

```javascript
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-select',
    '@radix-ui/react-label',
    '@radix-ui/react-tabs',
    '@radix-ui/react-avatar',
    '@tanstack/react-query',
  ],
},
```

**Expected Impact**: -20% compile time, -150 modules per page

#### 3. Remove Barrel Exports from `/components/ui`
**Current structure**:
```
components/ui/
  index.ts  ❌ (exports everything)
  button.tsx
  card.tsx
  ...
```

**Solution**: Delete `index.ts`, use direct imports
```typescript
// Before
import { Button, Card } from '@/components/ui'

// After  
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

**Expected Impact**: -25% compile time, -100 modules per page

#### 4. Code Splitting for Admin Pages
Create separate chunks for admin pages:

```javascript
// next.config.js
experimental: {
  optimizeCss: true,
  optimizeServerReact: true,
}
```

**Expected Impact**: -15% initial load

### MEDIUM PRIORITY (Moderate Impact)

#### 5. Enable Turbopack (Next.js 14+)
```bash
# Development only
npm run dev -- --turbo
```

Update `package.json`:
```json
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

**Expected Impact**: 40-70% faster refresh

#### 6. Lazy Load Heavy Components
For admin tables and data grids:

```typescript
import dynamic from 'next/dynamic'

const HeavyDataTable = dynamic(
  () => import('@/components/admin/DataTable'),
  { loading: () => <Skeleton /> }
)
```

**Expected Impact**: -10% initial compile

#### 7. Optimize Tanstack Query
Configure query defaults:

```typescript
// components/providers.tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})
```

#### 8. Use Next.js Image Optimization
Ensure all images use `next/image`:

```typescript
import Image from 'next/image'

// Instead of <img>
<Image 
  src="/logo.png" 
  width={200} 
  height={50}
  alt="Logo"
  priority // for above-fold images
/>
```

### LOW PRIORITY (Minor Impact)

#### 9. Reduce Global CSS
Split `globals.css` into route-specific CSS modules

#### 10. Configure Cache
Add `.next` to `.gitignore` and use persistent cache:

```javascript
// next.config.js
experimental: {
  incrementalCacheHandlerPath: require.resolve('./cache-handler.js'),
}
```

#### 11. Update Dependencies
```bash
npm update
npm outdated
```

Ensure latest versions:
- `next`: 14.x or 15.x
- `react`: 18.x
- `@tanstack/react-query`: 5.x

## 🎯 Quick Win Implementation

### Step 1: Update `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-label',
      '@radix-ui/react-tabs',
      '@radix-ui/react-avatar',
      '@tanstack/react-query',
    ],
    optimizeCss: true,
    optimizeServerReact: true,
  },
  
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
}

module.exports = nextConfig
```

### Step 2: Update `package.json`
```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "analyze": "ANALYZE=true next build"
  }
}
```

### Step 3: Clean & Restart
```bash
# Remove all caches
rm -rf .next
rm -rf node_modules/.cache

# Restart dev server
npm run dev
```

## 📈 Expected Results After Optimization

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial compile | 26s | 8-12s | -55% |
| Route compile | 5-6s | 1-2s | -70% |
| Hot reload | 1-18s | 0.3-1s | -85% |
| Modules/route | 1100 | 400-600 | -45% |
| Build time | N/A | Test after | TBD |

## 🔧 Monitoring & Validation

### After Each Change:
```bash
# 1. Clear cache
rm -rf .next

# 2. Restart dev
npm run dev

# 3. Navigate to slowest route (/admin/dashboard)
# 4. Check terminal output for compile time
# 5. Document improvement
```

### Build Analysis:
```bash
# Install analyzer
npm install -D @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true npm run build
```

## 🎓 Best Practices Going Forward

### DO ✅
- Use direct imports: `import { Button } from '@/components/ui/button'`
- Lazy load admin components with `dynamic()`
- Use `next/image` for all images
- Keep route components under 300 lines
- Use React.memo() for expensive components
- Configure query `staleTime` appropriately

### DON'T ❌
- Import entire icon libraries: `import * as Icons from 'lucide-react'`
- Use barrel exports in frequently imported directories
- Import unused components
- Nest dynamic imports more than 2 levels
- Forget to add `loading` states to dynamic imports

## 📝 Action Items (Checklist)

- [ ] Update `next.config.js` with optimizations
- [ ] Enable Turbopack in dev mode
- [ ] Remove barrel exports from `/components/ui`
- [ ] Update all icon imports
- [ ] Add lazy loading to admin tables
- [ ] Configure Tanstack Query defaults
- [ ] Run bundle analyzer
- [ ] Clean node_modules cache
- [ ] Test compile times
- [ ] Document improvements

## 🆘 If Issues Persist

1. Check Node.js version (should be 18.x or 20.x)
2. Verify no antivirus scanning `.next` folder
3. Check disk I/O performance
4. Review VSCode extensions (some can slow builds)
5. Try WSL2 if on Windows
6. Consider upgrading RAM (16GB+ recommended)

## 📚 Additional Resources

- [Next.js Optimizing Documentation](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Bundle Analysis Guide](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
- [Turbopack Documentation](https://turbo.build/pack/docs)
- [Performance Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)

---

**Last Updated**: January 16, 2026  
**Next Review**: After implementing HIGH priority items
