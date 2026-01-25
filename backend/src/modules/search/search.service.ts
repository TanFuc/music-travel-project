import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CacheService } from '@/cache/cache.service';
import { SearchDto, SearchType } from './dto/search.dto';

interface ShowResult {
  id: number;
  title: string;
  slug: string | null;
  description: string;
  performTime: Date;
  status: string;
  stage: {
    id: number;
    name: string;
    location: { id: number; name: string };
  };
  branch: { id: number; name: string } | null;
  minPrice: number | null;
  availableTickets: number;
}

interface TourResult {
  id: number;
  title: string;
  slug: string | null;
  duration: string;
  description: string;
  departureLoc: { id: number; name: string } | null;
  destinationLoc: { id: number; name: string } | null;
  branch: { id: number; name: string } | null;
  minPrice: number | null;
  nextSchedule: { id: number; startDate: Date; price: number } | null;
}

interface LocationResult {
  id: number;
  name: string;
  slug: string | null;
  showCount: number;
}

export interface SearchResults {
  shows: { items: ShowResult[]; total: number };
  tours: { items: TourResult[]; total: number };
  locations: { items: LocationResult[]; total: number };
  meta: {
    query: string;
    type: SearchType;
    page: number;
    limit: number;
  };
}

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async search(dto: SearchDto): Promise<SearchResults> {
    const { q = '', type = SearchType.ALL, locationId, branchId, fromDate, toDate, page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

    // Build cache key
    const cacheKey = `search:${JSON.stringify(dto)}`;
    const cached = await this.cacheService.get<SearchResults>(cacheKey);
    if (cached) return cached;

    const results: SearchResults = {
      shows: { items: [], total: 0 },
      tours: { items: [], total: 0 },
      locations: { items: [], total: 0 },
      meta: { query: q, type, page, limit },
    };

    const searchTerm = q.trim();

    // Search shows
    if (type === SearchType.ALL || type === SearchType.SHOWS) {
      const showsResult = await this.searchShows(searchTerm, { locationId, branchId, fromDate, toDate, skip, limit });
      results.shows = showsResult;
    }

    // Search tours
    if (type === SearchType.ALL || type === SearchType.TOURS) {
      const toursResult = await this.searchTours(searchTerm, { branchId, locationId, skip, limit });
      results.tours = toursResult;
    }

    // Search locations
    if (type === SearchType.ALL || type === SearchType.LOCATIONS) {
      const locationsResult = await this.searchLocations(searchTerm, { skip, limit });
      results.locations = locationsResult;
    }

    // Cache for 2 minutes
    await this.cacheService.set(cacheKey, results, 120);

    return results;
  }

  private async searchShows(
    searchTerm: string,
    filters: { locationId?: number; branchId?: number; fromDate?: string; toDate?: string; skip: number; limit: number },
  ) {
    const where: any = {
      deletedAt: null,
    };

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (filters.locationId) {
      where.stage = { locationId: filters.locationId };
    }

    if (filters.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters.fromDate) {
      where.performTime = { ...where.performTime, gte: new Date(filters.fromDate) };
    }

    if (filters.toDate) {
      where.performTime = { ...where.performTime, lte: new Date(filters.toDate) };
    }

    const [items, total] = await Promise.all([
      this.prisma.show.findMany({
        where,
        skip: filters.skip,
        take: filters.limit,
        include: {
          stage: {
            include: {
              location: { select: { id: true, name: true } },
            },
          },
          branch: { select: { id: true, name: true } },
          ticketClasses: { select: { price: true } },
          tickets: { where: { status: 'AVAILABLE' }, select: { id: true } },
        },
        orderBy: { performTime: 'asc' },
      }),
      this.prisma.show.count({ where }),
    ]);

    return {
      items: items.map((show) => ({
        id: show.id,
        title: show.title,
        slug: show.slug,
        description: show.description || '',
        performTime: show.performTime,
        status: show.status,
        stage: {
          id: show.stage.id,
          name: show.stage.name,
          location: show.stage.location,
        },
        branch: show.branch,
        minPrice: show.ticketClasses.length > 0 ? Math.min(...show.ticketClasses.map((tc) => Number(tc.price))) : null,
        availableTickets: show.tickets.length,
      })),
      total,
    };
  }

  private async searchTours(
    searchTerm: string,
    filters: { branchId?: number; locationId?: number; skip: number; limit: number },
  ) {
    const where: any = {
      deletedAt: null,
    };

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (filters.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters.locationId) {
      where.OR = [
        ...(where.OR || []),
        { departureLocId: filters.locationId },
        { destinationLocId: filters.locationId },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.tour.findMany({
        where,
        skip: filters.skip,
        take: filters.limit,
        include: {
          departureLoc: { select: { id: true, name: true } },
          destinationLoc: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
          schedules: {
            where: {
              status: 'OPEN',
              startDate: { gte: new Date() },
            },
            orderBy: { startDate: 'asc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tour.count({ where }),
    ]);

    return {
      items: items.map((tour) => ({
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        duration: tour.duration || '',
        description: tour.description || '',
        departureLoc: tour.departureLoc,
        destinationLoc: tour.destinationLoc,
        branch: tour.branch,
        minPrice: tour.schedules.length > 0 ? Number(tour.schedules[0].price) : null,
        nextSchedule: tour.schedules.length > 0
          ? { id: tour.schedules[0].id, startDate: tour.schedules[0].startDate, price: Number(tour.schedules[0].price) }
          : null,
      })),
      total,
    };
  }

  private async searchLocations(searchTerm: string, filters: { skip: number; limit: number }) {
    const where: any = {};

    if (searchTerm) {
      where.name = { contains: searchTerm, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        skip: filters.skip,
        take: filters.limit,
        include: {
          stages: {
            include: {
              shows: {
                where: { status: 'UPCOMING', deletedAt: null },
                select: { id: true },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.location.count({ where }),
    ]);

    return {
      items: items.map((loc) => ({
        id: loc.id,
        name: loc.name,
        slug: loc.slug,
        showCount: loc.stages.reduce((sum, stage) => sum + stage.shows.length, 0),
      })),
      total,
    };
  }
}
