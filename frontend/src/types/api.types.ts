// User types
export interface User {
  id: number;
  phoneNumber: string;
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN' | 'STAFF' | 'PARTNER';
  createdAt: string;
}

// Show types
export interface Show {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  performTime: string;
  checkInTime: string | null;
  status: 'UPCOMING' | 'ONGOING' | 'ENDED' | 'CANCELLED';
  stage: Stage;
  branch: Branch | null;
  artists: ShowArtist[];
  ticketClasses: TicketClass[];
  availableTickets: number;
  minPrice: number | null;
}

export interface Branch {
  id: number;
  name: string;
  description: string | null;
}

export interface Stage {
  id: number;
  name: string;
  address: string | null;
  location: Location;
}

export interface Location {
  id: number;
  name: string;
  slug: string;
}

export interface ShowArtist {
  id: number;
  name: string;
  bio: string | null;
  isHeadline: boolean;
}

export interface TicketClass {
  id: number;
  name: string;
  price: number;
  colorCode: string | null;
  availableCount: number;
}

export interface Ticket {
  id: number;
  ticketCode: string | null;
  status: 'AVAILABLE' | 'LOCKED' | 'SOLD';
  ticketClass: TicketClass;
  seat: SeatInfo | null;
}

export interface SeatInfo {
  id: number;
  zone: string | null;
  row: string | null;
  number: string | null;
  type: 'SEAT' | 'STANDING';
  x: number | null;
  y: number | null;
}

// Tour types
export interface Tour {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  duration: string | null;
  departureLoc: Location | null;
  destinationLoc: Location | null;
  branch: Branch | null;
  schedules: TourSchedule[];
  minPrice: number | null;
}

export interface TourSchedule {
  id: number;
  startDate: string;
  price: number;
  capacity: number;
  bookedCount: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
}

// Booking types
export interface Booking {
  id: number;
  bookingCode: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  createdAt: string;
  items: BookingItem[];
}

export interface BookingItem {
  id: number;
  itemType: 'SHOW_TICKET' | 'TOUR_SLOT';
  quantity: number;
  originalPrice: number;
  ticket?: Ticket & { show: Show };
  tourSchedule?: TourSchedule & { tour: Tour };
}

// Wallet types
export interface Wallet {
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'LOCKED';
}

export interface WalletTransaction {
  id: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: 'DEPOSIT' | 'PAYMENT' | 'REFUND' | 'WITHDRAW';
  description: string | null;
  createdAt: string;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'PROMOTION' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  code: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
