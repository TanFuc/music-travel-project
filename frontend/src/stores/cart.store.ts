import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TicketItem {
  ticketId: number;
  showId: number;
  showTitle: string;
  ticketClassId: number;
  ticketClassName: string;
  price: number;
  seatInfo?: string;
}

interface TourItem {
  scheduleId: number;
  tourId: number;
  tourTitle: string;
  startDate: string;
  price: number;
  quantity: number;
}

interface CartState {
  tickets: TicketItem[];
  tours: TourItem[];
  voucherCode: string | null;
  discount: number;

  // Computed
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;

  // Actions
  addTicket: (ticket: TicketItem) => void;
  removeTicket: (ticketId: number) => void;
  addTour: (tour: TourItem) => void;
  removeTour: (scheduleId: number) => void;
  updateTourQuantity: (scheduleId: number, quantity: number) => void;
  setVoucher: (code: string, discount: number) => void;
  clearVoucher: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tickets: [],
      tours: [],
      voucherCode: null,
      discount: 0,

      getSubtotal: () => {
        const ticketTotal = get().tickets.reduce((sum, t) => sum + t.price, 0);
        const tourTotal = get().tours.reduce((sum, t) => sum + t.price * t.quantity, 0);
        return ticketTotal + tourTotal;
      },

      getTotal: () => {
        return get().getSubtotal() - get().discount;
      },

      getItemCount: () => {
        const ticketCount = get().tickets.length;
        const tourCount = get().tours.reduce((sum, t) => sum + t.quantity, 0);
        return ticketCount + tourCount;
      },

      addTicket: (ticket) =>
        set((state) => ({
          tickets: [...state.tickets.filter((t) => t.ticketId !== ticket.ticketId), ticket],
        })),

      removeTicket: (ticketId) =>
        set((state) => ({
          tickets: state.tickets.filter((t) => t.ticketId !== ticketId),
        })),

      addTour: (tour) =>
        set((state) => {
          const existing = state.tours.find((t) => t.scheduleId === tour.scheduleId);
          if (existing) {
            return {
              tours: state.tours.map((t) =>
                t.scheduleId === tour.scheduleId
                  ? { ...t, quantity: t.quantity + tour.quantity }
                  : t
              ),
            };
          }
          return { tours: [...state.tours, tour] };
        }),

      removeTour: (scheduleId) =>
        set((state) => ({
          tours: state.tours.filter((t) => t.scheduleId !== scheduleId),
        })),

      updateTourQuantity: (scheduleId, quantity) =>
        set((state) => ({
          tours:
            quantity > 0
              ? state.tours.map((t) => (t.scheduleId === scheduleId ? { ...t, quantity } : t))
              : state.tours.filter((t) => t.scheduleId !== scheduleId),
        })),

      setVoucher: (code, discount) => set({ voucherCode: code, discount }),

      clearVoucher: () => set({ voucherCode: null, discount: 0 }),

      clearCart: () => set({ tickets: [], tours: [], voucherCode: null, discount: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
