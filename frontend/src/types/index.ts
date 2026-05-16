export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface Tour {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image?: string;
  location?: string;
  duration?: number;
  rating?: number;
  isCombo?: boolean;
  linkedShowId?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Show {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  date?: Date;
  location?: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface Ticket {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  showId: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description?: string;
  maxSeats?: number;
}
export interface Booking {
  id: string;
  userId?: string;
  tourId?: string;
  showId?: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
export interface Banner {
  id: string;
  title: string;
  image?: string;
  isActive: boolean;
  position: 'top' | 'middle' | 'bottom';
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF' | 'USER' | 'PARTNER';
  createdAt: Date;
  updatedAt: Date;
}
export interface CartItem {
  id: string;
  tourId?: string;
  showId?: string;
  ticketId?: string;
  quantity: number;
  price: number;
}
export interface AuthState {
  user?: User;
  token?: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}
