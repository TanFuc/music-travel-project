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
  ticketTypeName?: string;
}
interface SingerPackageItem {
  packageId: string;
  packageName: string;
  price: number;
  quantity: number;
  description?: string;
  benefits?: string[];
}
interface CartState {
  userId: number | null;
  tickets: TicketItem[];
  tours: TourItem[];
  singerPackages: SingerPackageItem[];
  voucherCode: string | null;
  discount: number;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  setUserId: (userId: number | null) => void;
  addTicket: (ticket: TicketItem) => void;
  removeTicket: (ticketId: number) => void;
  addTour: (tour: TourItem) => void;
  removeTour: (scheduleId: number) => void;
  updateTourQuantity: (scheduleId: number, quantity: number) => void;
  updateTicketQuantity: (showId: number, ticketClassId: number, quantity: number) => void;
  addSingerPackage: (pkg: SingerPackageItem) => void;
  removeSingerPackage: (packageId: string) => void;
  updateSingerPackageQuantity: (packageId: string, quantity: number) => void;
  setVoucher: (code: string, discount: number) => void;
  clearVoucher: () => void;
  clearCart: () => void;
}
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      userId: null,
      tickets: [],
      tours: [],
      singerPackages: [],
      voucherCode: null,
      discount: 0,
      getSubtotal: () => {
        const ticketTotal = get().tickets.reduce((sum, t) => sum + Number(t.price), 0);
        const tourTotal = get().tours.reduce(
          (sum, t) => sum + Number(t.price) * Number(t.quantity),
          0
        );
        const packageTotal = get().singerPackages.reduce(
          (sum, p) => sum + Number(p.price) * Number(p.quantity),
          0
        );
        return ticketTotal + tourTotal + packageTotal;
      },
      getTotal: () => {
        return get().getSubtotal() - get().discount;
      },
      getItemCount: () => {
        const ticketCount = get().tickets.length;
        const tourCount = get().tours.reduce((sum, t) => sum + t.quantity, 0);
        const packageCount = get().singerPackages.reduce((sum, p) => sum + p.quantity, 0);
        return ticketCount + tourCount + packageCount;
      },
      setUserId: (userId) => {
        const currentUserId = get().userId;
        if (currentUserId !== null && currentUserId !== userId) {
          set({
            userId,
            tickets: [],
            tours: [],
            singerPackages: [],
            voucherCode: null,
            discount: 0,
          });
        } else {
          set({ userId });
        }
      },
      addTicket: (ticket) =>
        set((state) => ({
          tickets: [
            ...state.tickets.filter((t) => t.ticketId !== ticket.ticketId),
            { ...ticket, price: Number(ticket.price) },
          ],
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
          return { tours: [...state.tours, { ...tour, price: Number(tour.price) }] };
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
      updateTicketQuantity: (showId, ticketClassId, quantity) =>
        set((state) => {
          const classTickets = state.tickets.filter(
            (t) => t.showId === showId && t.ticketClassId === ticketClassId
          );
          const currentQty = classTickets.length;
          if (quantity <= 0) {
            return {
              tickets: state.tickets.filter(
                (t) => !(t.showId === showId && t.ticketClassId === ticketClassId)
              ),
            };
          }
          if (quantity > currentQty) {
            const baseTicket =
              classTickets[0] ||
              state.tickets.find((t) => t.showId === showId && t.ticketClassId === ticketClassId);
            if (!baseTicket) return state;
            const newTickets = [...Array(quantity - currentQty)].map((_, i) => ({
              ...baseTicket,
              ticketId: Date.now() + Math.random() + i,
            }));
            return { tickets: [...state.tickets, ...newTickets] };
          } else if (quantity < currentQty) {
            const otherTickets = state.tickets.filter(
              (t) => !(t.showId === showId && t.ticketClassId === ticketClassId)
            );
            const keptTickets = classTickets.slice(0, quantity);
            return { tickets: [...otherTickets, ...keptTickets] };
          }
          return state;
        }),
      addSingerPackage: (pkg) =>
        set((state) => {
          const existing = state.singerPackages.find((p) => p.packageId === pkg.packageId);
          if (existing) {
            return {
              singerPackages: state.singerPackages.map((p) =>
                p.packageId === pkg.packageId ? { ...p, quantity: p.quantity + pkg.quantity } : p
              ),
            };
          }
          return {
            singerPackages: [...state.singerPackages, { ...pkg, price: Number(pkg.price) }],
          };
        }),
      removeSingerPackage: (packageId) =>
        set((state) => ({
          singerPackages: state.singerPackages.filter((p) => p.packageId !== packageId),
        })),
      updateSingerPackageQuantity: (packageId, quantity) =>
        set((state) => ({
          singerPackages:
            quantity > 0
              ? state.singerPackages.map((p) =>
                  p.packageId === packageId ? { ...p, quantity } : p
                )
              : state.singerPackages.filter((p) => p.packageId !== packageId),
        })),
      setVoucher: (code, discount) => set({ voucherCode: code, discount }),
      clearVoucher: () => set({ voucherCode: null, discount: 0 }),
      clearCart: () =>
        set({
          userId: null,
          tickets: [],
          tours: [],
          singerPackages: [],
          voucherCode: null,
          discount: 0,
        }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
if (typeof window !== 'undefined') {
  window.addEventListener('cart-clear', () => {
    useCartStore.getState().clearCart();
  });
  window.addEventListener('cart-set-user', ((event: CustomEvent) => {
    const { userId } = event.detail;
    useCartStore.getState().setUserId(userId);
  }) as EventListener);
}
