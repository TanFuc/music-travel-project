/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Check if running with Turbopack (dev mode with --turbo flag)
const isTurbopack = process.env.TURBOPACK === '1';

const nextConfig = {
  // Enable strict mode to catch potential issues
  reactStrictMode: true,

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Modern image formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Optimized device sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Experimental features for performance
  experimental: {
    // Optimize package imports for tree-shaking
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-label',
      '@radix-ui/react-tabs',
      '@radix-ui/react-avatar',
      '@radix-ui/react-toast',
      '@radix-ui/react-separator',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-switch',
      '@tanstack/react-query',
      'framer-motion',
      'date-fns',
    ],
    // Optimize CSS
    optimizeCss: true,
    // Disable client router cache to prevent RSC request spam
    staleTimes: {
      dynamic: 0,
      static: 180,
    },
  },

  // Modularize imports for better tree-shaking
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
  },

  // Compiler optimizations (not supported by Turbopack yet)
  ...(isTurbopack
    ? {}
    : {
      compiler: {
        // Remove console.log in production (keep error and warn)
        removeConsole: process.env.NODE_ENV === 'production' ? {
          exclude: ['error', 'warn'],
        } : false,
      },
    }),

  // Webpack optimizations for better code splitting
  webpack: (config, { dev, isServer }) => {
    // Production optimizations for client-side bundle
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // React/Next.js framework
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|next|scheduler)[\\/]/,
              priority: 40,
              reuseExistingChunk: true,
              enforce: true,
            },
            // UI libraries (Radix UI, Framer Motion, Lucide)
            ui: {
              name: 'ui',
              test: /[\\/]node_modules[\\/](@radix-ui|framer-motion|lucide-react)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            // Heavy libraries (Konva, QR, Chart) - lazy loaded
            heavy: {
              name: 'heavy',
              test: /[\\/]node_modules[\\/](konva|react-konva|qrcode|chart\.js|react-chartjs-2)[\\/]/,
              priority: 25,
              reuseExistingChunk: true,
            },
            // Form libraries (React Hook Form, Zod)
            forms: {
              name: 'forms',
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
              priority: 22,
              reuseExistingChunk: true,
            },
            // Common vendor code
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common app code used in multiple places
            common: {
              name: 'common',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },

  // API rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/:path*`,
      },
    ];
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
