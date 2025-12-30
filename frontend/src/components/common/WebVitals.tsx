'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: Math.round(metric.value),
        rating: metric.rating,
        delta: Math.round(metric.delta),
      });
    }

    // In production, you could send to analytics
    // Example: send to Google Analytics, Vercel Analytics, etc.
    // window.gtag?.('event', metric.name, {
    //   value: Math.round(metric.value),
    //   metric_id: metric.id,
    //   metric_rating: metric.rating,
    // });
  });

  return null;
}
