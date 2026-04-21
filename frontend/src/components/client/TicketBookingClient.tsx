'use client';
import { useState } from 'react';
import { Link } from '@/components/common/Link';
import { Ticket, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart.store';
import { toast } from 'sonner';
interface TicketClass {
  id: number;
  name: string;
  price: number;
  colorCode?: string | null;
  availableCount?: number;
}
interface TicketBookingClientProps {
  showId: number;
  showTitle: string;
  ticketClasses?: TicketClass[];
  isBookable: boolean;
}
export function TicketBookingClient({
  showId,
  showTitle,
  ticketClasses = [],
  isBookable,
}: TicketBookingClientProps) {
  const addTicket = useCartStore((state) => state.addTicket);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const handleAddToCart = (ticketClass: TicketClass) => {
    addTicket({
      ticketId: Date.now(),
      showId,
      showTitle,
      ticketClassId: ticketClass.id,
      ticketClassName: ticketClass.name || 'Chung',
      price: ticketClass.price,
    });
    toast.success('Đã thêm vé vào giỏ hàng!');
    setSelectedClass(ticketClass.id);
    setTimeout(() => setSelectedClass(null), 1000);
  };
  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-500/10">
      <div className="pointer-events-none absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-brand-50 blur-3xl" />

      <div className="relative z-10 space-y-6 text-center">
        <div>
          <h3 className="font-display text-xl font-bold text-gray-900">Đặt vé ngay</h3>
          <p className="mt-1 text-sm text-neutral-500">Số lượng vé có hạn cho show diễn này</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-xl bg-neutral-50 p-3 text-left">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
            <div>
              <p className="text-sm font-bold text-gray-900">Vé không định danh</p>
              <p className="text-xs text-neutral-500">Dễ dàng tặng hoặc nhượng lại</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-neutral-50 p-3 text-left">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
            <div>
              <p className="text-sm font-bold text-gray-900">Check-in QR Code</p>
              <p className="text-xs text-neutral-500">Quét mã vào cửa nhanh chóng</p>
            </div>
          </div>
        </div>

        {isBookable ? (
          <Link href="/tickets" prefetch={false} className="block">
            <Button className="btn-neon h-14 w-full rounded-2xl text-lg font-bold shadow-lg shadow-brand-500/20">
              <Ticket className="mr-2 h-5 w-5" />
              MUA VÉ NGAY
            </Button>
          </Link>
        ) : (
          <Button
            disabled
            className="h-14 w-full cursor-not-allowed rounded-2xl bg-gray-200 text-lg font-bold text-gray-500"
          >
            Không còn mở bán
          </Button>
        )}

        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          Thanh toán an toàn &bull; Hỗ trợ 24/7
        </p>
      </div>
    </div>
  );
}
