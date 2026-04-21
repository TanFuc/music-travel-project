import { get, post, del } from '@/lib/api';
import { TicketTier } from '@/types/api.types';
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
  getTiers: () => get<TicketTier[]>('/tickets/tiers'),
  lockTickets: (ticketIds: number[]) =>
    post<LockTicketsResponse, LockTicketsRequest>('/tickets/lock', { ticketIds }),
  releaseTicket: (ticketId: number) =>
    del<{
      message: string;
    }>(`/tickets/lock/${ticketId}`),
  releaseAllTickets: () =>
    del<{
      releasedCount: number;
      message: string;
    }>('/tickets/lock'),
  getQRCode: (ticketId: number) => get<QRCodeResponse>(`/tickets/${ticketId}/qrcode`),
  getQRBatch: (bookingId: number) => get<QRBatchItem[]>(`/tickets/booking/${bookingId}/qrcodes`),
  getTicketsByBooking: (bookingId: number) =>
    get<TicketWithDetails[]>(`/tickets/booking/${bookingId}`),
  validateOwnership: (ticketId: number) =>
    get<{
      isOwner: boolean;
    }>(`/tickets/${ticketId}/validate`),
};
