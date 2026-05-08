const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://maichohanhtinhxanh.com').replace(
  /\/$/,
  ''
);
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2222/api/v1').replace(
  /\/$/,
  ''
);
export async function fetchAllEntitySlugs(endpoint: string) {
  const allItems: any[] = [];
  let currentPage = 1;
  const limit = 100;
  try {
    while (currentPage <= 5) {
      const sep = endpoint.includes('?') ? '&' : '?';
      const url = `${API_URL}${endpoint}${sep}limit=${limit}&page=${currentPage}`;
      const response = await fetch(url, {
        next: { revalidate: 3600 },
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) break;
      const json = await response.json();
      const items = json?.data || [];
      if (!Array.isArray(items) || items.length === 0) break;
      allItems.push(...items);
      if (items.length < limit) break;
      currentPage++;
    }
    return allItems;
  } catch (error) {
    return [];
  }
}
export function wrapInUrlSet(content: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${content}
</urlset>`;
}
export function wrapInSitemapIndex(content: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${content}
</sitemapindex>`;
}
export function formatUrl({ loc, lastmod, changefreq, priority, image }: any) {
  let xml = `  <url>\n    <loc>${loc}</loc>\n`;
  if (lastmod) xml += `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n`;
  if (changefreq) xml += `    <changefreq>${changefreq}</changefreq>\n`;
  if (priority) xml += `    <priority>${priority}</priority>\n`;
  if (image) {
    xml += `    <image:image>\n      <image:loc>${image}</image:loc>\n    </image:image>\n`;
  }
  xml += `  </url>`;
  return xml;
}
export { SITE_URL };
