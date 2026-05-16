import * as fs from 'fs';
import * as path from 'path';

export interface ParsedTicketType {
  name: string;
  price: number;
  imageUrl?: string;
}

export interface ParsedShowSeedItem {
  title: string;
  slug: string;
  performTime: Date;
  checkInTime: Date;
  locationText: string;
  city: string;
  thumbnailUrl: string;
  description: string;
  ticketTypes: ParsedTicketType[];
}

export interface ParsedTourSeedItem {
  title: string;
  slug: string;
  performTime: Date;
  locationText: string;
  city: string;
  thumbnailUrl: string;
  description: string;
  ticketTypes: ParsedTicketType[];
}

function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUrl(raw?: string): string {
  if (!raw) return '';
  let url = raw.startsWith('//') ? `https:${raw}` : raw;
  // Remove thumbnail suffixes like _385x481, _400x400 to get original high-quality images
  url = url.replace(/_\d+x\d+(\.\w+)$/i, '$1');
  return url;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function splitSections(content: string): string[] {
  return content
    .split(/\n\s*\d+\.?\s*\n/g)
    .map((section) => section.trim())
    .filter((section) => section.includes('card-title'));
}

function extractTitle(section: string): string {
  const match = section.match(/<div class="card-title">([\s\S]*?)<\/div>/i);
  if (!match) return 'Untitled';
  return cleanText(match[1]);
}

function extractDate(section: string): Date {
  const match = section.match(/fa-regular fa-calendar[\s\S]*?>\s*(\d{2}\/\d{2}\/\d{4})\s*\|\s*(\d{2}:\d{2})/i);
  if (!match) return new Date();

  const [day, month, year] = match[1].split('/').map((x) => parseInt(x, 10));
  const [hour, minute] = match[2].split(':').map((x) => parseInt(x, 10));
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function extractLocation(section: string): { locationText: string; city: string } {
  const match = section.match(/fa-solid fa-location-dot[\s\S]*?>\s*([\s\S]*?)<\/div>/i);
  const raw = match ? cleanText(match[1]) : '';
  const chunks = raw.split('|').map((x) => x.trim()).filter(Boolean);
  const city = chunks.length > 1 ? chunks[chunks.length - 1] : (chunks[0] || 'Hồ Chí Minh');
  return {
    locationText: raw,
    city,
  };
}

function extractFirstImage(section: string): string {
  const mainCardImage = section.match(/card-img-wrap[\s\S]*?<img\s+src="([^"]+)"/i);
  if (mainCardImage?.[1]) {
    return normalizeUrl(mainCardImage[1]);
  }

  const anyImage = section.match(/<img\s+[^>]*src="([^"]+)"/i);
  return normalizeUrl(anyImage?.[1] || '');
}

function extractDescription(section: string): string {
  const contentMatch = section.match(/<div style="padding:\s*10px 0" class="show-content">([\s\S]*?)<\/div>/i);
  if (!contentMatch) return '';
  return contentMatch[1].trim();
}

function extractTicketTypes(section: string): ParsedTicketType[] {
  const types: ParsedTicketType[] = [];
  const regex = /data-name="([^"]+)"[\s\S]*?data-image="([^"]*)"[\s\S]*?data-price="(\d+)"/gi;

  let match: RegExpExecArray | null = regex.exec(section);
  while (match) {
    types.push({
      name: cleanText(match[1]),
      imageUrl: normalizeUrl(match[2]),
      price: Number(match[3]),
    });
    match = regex.exec(section);
  }

  return types;
}

function loadRawFile(relativeToRepoRoot: string): string {
  const absolute = path.resolve(process.cwd(), '..', relativeToRepoRoot);
  return fs.readFileSync(absolute, 'utf8');
}

export function loadShowSeedItemsFromMarkdown(): ParsedShowSeedItem[] {
  const raw = loadRawFile('shows.md');
  const sections = splitSections(raw);

  return sections.map((section) => {
    const title = extractTitle(section);
    const performTime = extractDate(section);
    const { locationText, city } = extractLocation(section);
    const thumbnailUrl = extractFirstImage(section);
    const description = extractDescription(section);
    const ticketTypes = extractTicketTypes(section);

    return {
      title,
      slug: slugify(title),
      performTime,
      checkInTime: new Date(performTime.getTime() - 60 * 60 * 1000),
      locationText,
      city,
      thumbnailUrl,
      description,
      ticketTypes,
    };
  });
}

export function loadTourSeedItemsFromMarkdown(): ParsedTourSeedItem[] {
  const raw = loadRawFile('tours.md');
  const sections = splitSections(raw);

  return sections.map((section) => {
    const title = extractTitle(section);
    const performTime = extractDate(section);
    const { locationText, city } = extractLocation(section);
    const thumbnailUrl = extractFirstImage(section);
    const description = extractDescription(section);
    const ticketTypes = extractTicketTypes(section);

    return {
      title,
      slug: slugify(title),
      performTime,
      locationText,
      city,
      thumbnailUrl,
      description,
      ticketTypes,
    };
  });
}
