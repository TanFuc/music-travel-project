import { get, post, del } from '@/lib/api';

export interface LockTicketsRequest {
  ticketIds: number[];
}

export interface LockTicketsResponse {
  lockId: string;
  lockedTickets: number[];
  expiresAt: string;
  totalPrice: number;
  message: string;
}

export interface QRCodeResponse {
  qrDataUrl: string;
  expiresAt: string;
}

export interface QRBatchItem {
  ticketId: number;
  ticketCode: string;
  qrDataUrl: string;
  seatInfo: string | null;
}

export interface TicketWithDetails {
  id: number;
  ticketCode: string | null;
  status: 'AVAILABLE' | 'LOCKED' | 'SOLD';
  isCheckedIn: boolean;
  checkedInAt: string | null;
  show: {
    id: number;
    title: string;
    performTime: string;
    checkInTime: string | null;
    status: string;
    stage: {
      id: number;
      name: string;
      address: string | null;
    };
  };
  ticketClass: {
    id: number;
    name: string;
    price: number;
    colorCode: string | null;
  };
  seat: {
    zone: string | null;
    row: string | null;
    number: string | null;
    type: 'SEAT' | 'STANDING';
  } | null;
}

export interface SeatMapTicket {
  id: number;
  status: 'AVAILABLE' | 'LOCKED' | 'SOLD';
  ticketClass: {
    id: number;
    name: string;
    colorCode: string | null;
    price: number;
  };
  seat: {
    id: number;
    zone: string | null;
    row: string | null;
    number: string | null;
    type: 'SEAT' | 'STANDING';
    x: number | null;
    y: number | null;
  } | null;
}

export const ticketService = {
  /**
   * Lock tickets for purchase
   */
  lockTickets: (ticketIds: number[]) =>
    post<LockTicketsResponse, LockTicketsRequest>('/tickets/lock', { ticketIds }),

  /**
   * Release a specific locked ticket
   */
  releaseTicket: (ticketId: number) =>
    del<{ message: string }>(`/tickets/lock/${ticketId}`),

  /**
   * Release all locked tickets for current user
   */
  releaseAllTickets: () =>
    del<{ releasedCount: number; message: string }>('/tickets/lock'),

  /**
   * Get QR code for a single ticket
   */
  getQRCode: (ticketId: number) =>
    get<QRCodeResponse>(`/tickets/${ticketId}/qrcode`),

  /**
   * Get QR codes for all tickets in a booking
   */
  getQRBatch: (bookingId: number) =>
    get<QRBatchItem[]>(`/tickets/booking/${bookingId}/qrcodes`),

  /**
   * Get all tickets for a booking
   */
  getTicketsByBooking: (bookingId: number) =>
    get<TicketWithDetails[]>(`/tickets/booking/${bookingId}`),

  /**
   * Validate ticket ownership
   */
  validateOwnership: (ticketId: number) =>
    get<{ isOwner: boolean }>(`/tickets/${ticketId}/validate`),
};
