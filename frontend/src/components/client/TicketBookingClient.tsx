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
    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-brand-500/10 border border-brand-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      <div className="relative z-10 text-center space-y-6">
        <div>
          <h3 className="text-xl font-display font-bold text-gray-900">Đặt vé ngay</h3>
          <p className="text-neutral-500 text-sm mt-1">
            Số lượng vé có hạn cho show diễn này
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 text-left p-3 rounded-xl bg-neutral-50">
            <CheckCircle2 className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-gray-900">Vé không định danh</p>
              <p className="text-xs text-neutral-500">Dễ dàng tặng hoặc nhượng lại</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-left p-3 rounded-xl bg-neutral-50">
            <CheckCircle2 className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-gray-900">Check-in QR Code</p>
              <p className="text-xs text-neutral-500">Quét mã vào cửa nhanh chóng</p>
            </div>
          </div>
        </div>

        {isBookable ? (
          <Link href="/tickets" prefetch={false} className="block">
            <Button className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-brand-500/20 btn-neon">
              <Ticket className="mr-2 h-5 w-5" />
              MUA VÉ NGAY
            </Button>
          </Link>
        ) : (
          <Button
            disabled
            className="w-full h-14 text-lg font-bold rounded-2xl bg-gray-200 text-gray-500 cursor-not-allowed"
          >
            Không còn mở bán
          </Button>
        )}

        <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
          Thanh toán an toàn &bull; Hỗ trợ 24/7
        </p>
      </div>
    </div>
  );
}
