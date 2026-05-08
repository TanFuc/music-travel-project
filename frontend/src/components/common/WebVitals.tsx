'use client';
import { useReportWebVitals } from 'next/web-vitals';
export function WebVitals() {
  useReportWebVitals((_metric) => {
    if (process.env.NODE_ENV === 'development') {
    }
  });
  return null;
}
