import { get } from '@/lib/api';

export type SearchType = 'all' | 'shows' | 'tours' | 'locations';

export interface SearchFilters {
  q?: string;
  type?: SearchType;
  locationId?: number;
  branchId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface ShowResult {
  id: number;
  title: string;
  slug: string;
  description: string;
  performTime: string;
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

export interface TourResult {
  id: number;
  title: string;
  slug: string;
  duration: string;
  description: string;
  departureLoc: { id: number; name: string } | null;
  destinationLoc: { id: number; name: string } | null;
  branch: { id: number; name: string } | null;
  minPrice: number | null;
  nextSchedule: { id: number; startDate: string; price: number } | null;
}

export interface LocationResult {
  id: number;
  name: string;
  slug: string;
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

export const searchService = {
  search: (filters: SearchFilters): Promise<SearchResults> => {
    const params = new URLSearchParams();

    if (filters.q) params.append('q', filters.q);
    if (filters.type) params.append('type', filters.type);
    if (filters.locationId) params.append('locationId', String(filters.locationId));
    if (filters.branchId) params.append('branchId', String(filters.branchId));
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    return get<SearchResults>(`/search${queryString ? `?${queryString}` : ''}`);
  },
};
