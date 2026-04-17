const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env || {};

export const SITE_URL = (env.NEXT_PUBLIC_SITE_URL || 'https://musictravel.vn').replace(/\/$/, '');

export function toAbsoluteUrl(path: string): string {
  if (!path) {
    return SITE_URL;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function stripHtml(input?: string | null): string {
  if (!input) {
    return '';
  }
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
