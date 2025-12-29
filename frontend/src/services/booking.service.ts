import { get, post, del } from '@/lib/api';
import { Booking } from '@/types/api.types';

export interface LockTicketsRequest {
  ticketIds: number[];
}

export interface LockTicketsResponse {
  lockId: string;
  expiresAt: string;
  tickets: Array<{
    id: number;
    ticketCode: string;
    price: number;
  }>;
}

export interface CreateBookingRequest {
  lockId?: string;
  items: Array<{
    type: 'SHOW_TICKET' | 'TOUR_SLOT';
    ticketIds?: number[];
    tourScheduleId?: number;
    quantity?: number;
    passengers?: Array<{
      fullName: string;
      dateOfBirth?: string;
      idNumber?: string;
    }>;
  }>;
  voucherCode?: string;
  note?: string;
}

export interface BookingsFilter {
  page?: number;
  limit?: number;
  status?: string;
}

export interface BookingsResponse {
  items: Booking[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const bookingService = {
  lockTickets: (data: LockTicketsRequest) => post<LockTicketsResponse>('/tickets/lock', data),

  releaseLock: (lockId: string) => del<void>(`/tickets/lock/${lockId}`),

  createBooking: (data: CreateBookingRequest) => post<Booking>('/bookings', data),

  getBookingByCode: (code: string) => get<Booking>(`/bookings/${code}`),

  getUserBookings: (filters?: BookingsFilter) => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    return get<BookingsResponse>(`/users/me/bookings${queryString ? `?${queryString}` : ''}`);
  },

  cancelBooking: (bookingId: number) => post<Booking>(`/bookings/${bookingId}/cancel`),
};
