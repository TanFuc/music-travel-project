'use client';
import { useState } from 'react';
import { Ticket, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart.store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const getQuantity = (classId: number) => quantities[classId] || 1;
  const updateQuantity = (classId: number, delta: number) => {
    const current = getQuantity(classId);
    const next = Math.max(1, Math.min(10, current + delta));
    setQuantities({ ...quantities, [classId]: next });
  };
  const handleAddToCart = (ticketClass: TicketClass) => {
    const q = getQuantity(ticketClass.id);
    for (let i = 0; i < q; i++) {
      addTicket({
        ticketId: Date.now() + i,
        showId,
        showTitle,
        ticketClassId: ticketClass.id,
        ticketClassName: ticketClass.name || 'Chung',
        price: ticketClass.price,
      });
    }
    toast.success(`Đã thêm ${q} vé vào giỏ hàng!`);
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

        <div className="custom-scrollbar max-h-[450px] space-y-4 overflow-y-auto pb-4 pr-2">
          {ticketClasses.length > 0 ? (
            ticketClasses.map((ticketClass) => (
              <div
                key={ticketClass.id}
                className="group/ticket relative flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-white p-4 transition-all hover:border-brand-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{ticketClass.name}</p>
                    <p className="text-lg font-black text-brand-600">
                      {new Intl.NumberFormat('vi-VN').format(ticketClass.price)}đ
                    </p>
                  </div>
                  {ticketClass.availableCount !== undefined && ticketClass.availableCount < 20 && (
                    <Badge className="border-none bg-orange-50 text-[10px] text-orange-600 hover:bg-orange-50">
                      Còn {ticketClass.availableCount} vé
                    </Badge>
                  )}
                </div>

                {isBookable ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-gray-500">Số lượng</span>
                      <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-md bg-white hover:bg-neutral-50"
                          onClick={() => updateQuantity(ticketClass.id, -1)}
                          disabled={getQuantity(ticketClass.id) <= 1}
                        >
                          -
                        </Button>
                        <div className="w-8 text-center text-sm font-bold">
                          {getQuantity(ticketClass.id)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-md bg-white hover:bg-neutral-50"
                          onClick={() => updateQuantity(ticketClass.id, 1)}
                          disabled={getQuantity(ticketClass.id) >= 10}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddToCart(ticketClass)}
                      className={cn(
                        'h-11 w-full rounded-xl font-bold shadow-md transition-all active:scale-95',
                        selectedClass === ticketClass.id
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-brand-600 text-white hover:bg-brand-700'
                      )}
                    >
                      {selectedClass === ticketClass.id ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Đã thêm {getQuantity(ticketClass.id)} vé
                        </>
                      ) : (
                        <>
                          <Ticket className="mr-2 h-4 w-4" />
                          Thêm vào giỏ hàng
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    disabled
                    className="h-10 w-full cursor-not-allowed rounded-xl bg-gray-50 font-bold text-gray-400"
                  >
                    Hết vé
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="py-4 text-sm italic text-neutral-500">
              Hiện chưa có thông tin hạng vé cụ thể
            </p>
          )}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          Thanh toán an toàn &bull; Hỗ trợ 24/7
        </p>
      </div>
    </div>
  );
}
