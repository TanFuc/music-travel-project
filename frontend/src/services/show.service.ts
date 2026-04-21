import { get } from '@/lib/api';
import { Show, Ticket } from '@/types/api.types';
export interface ShowsFilter {
  page?: number;
  limit?: number;
  status?: string;
  locationId?: number;
  branchId?: number;
  search?: string;
}
export interface ShowsResponse {
  items: Show[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface ShowDetailResponse extends Show {
  seatMap?: {
    width: number;
    height: number;
    seats: Array<{
      id: number;
      x: number;
      y: number;
      zone: string;
      row: string;
      number: string;
      status: 'AVAILABLE' | 'LOCKED' | 'SOLD';
      ticketClassId: number;
    }>;
  };
}
export interface SeatsResponse {
  tickets: Ticket[];
  seatMap?: {
    width: number;
    height: number;
    zones: Array<{
      id: number;
      name: string;
      color: string;
    }>;
  };
}
export const showService = {
  getShows: (filters?: ShowsFilter) => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.status) params.append('status', filters.status);
    if (filters?.locationId) params.append('locationId', String(filters.locationId));
    if (filters?.branchId) params.append('branchId', String(filters.branchId));
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString();
    return get<ShowsResponse>(`/shows${queryString ? `?${queryString}` : ''}`);
  },
  getShowBySlug: (slug: string) => get<ShowDetailResponse>(`/shows/${slug}`),
  getShowSeats: (showId: number) => get<SeatsResponse>(`/shows/${showId}/seats`),
};
