'use client';
import { useState } from 'react';
import { Link } from '@/components/common/Link';
import { Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { toast } from 'sonner';
interface TourSchedule {
  id: number;
  startDate: string;
  price: number;
  capacity: number;
  bookedCount: number;
  status: string;
}
interface TourBookingClientProps {
  tourId: number;
  tourTitle: string;
  schedules: TourSchedule[];
}
export function TourBookingClient({ tourId, tourTitle, schedules }: TourBookingClientProps) {
  const addTour = useCartStore((state) => state.addTour);
  const [quantity, setQuantity] = useState(1);
  const openSchedules = schedules.filter((s) => s.status === 'OPEN');
  const handleAddToCart = (schedule: TourSchedule) => {
    addTour({
      scheduleId: schedule.id,
      tourId,
      tourTitle,
      startDate: schedule.startDate,
      price: schedule.price,
      quantity,
    });
    toast.success('Đã thêm tour vào giỏ hàng!');
  };
  return (
    <>
      <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-500/10">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Ticket className="h-5 w-5" />
          </div>
          <h3 className="font-display text-xl font-bold text-gray-900">Đặt tour ngay</h3>
        </div>

        {openSchedules.length === 0 ? (
          <div className="rounded-2xl bg-neutral-50 py-6 text-center">
            <p className="text-sm text-neutral-500">Hiện tại không có lịch khởi hành.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="flex justify-between text-sm font-bold text-gray-700">
                Số lượng khách
                <span className="font-normal text-brand-600">{quantity} người</span>
              </label>
              <div className="flex items-center rounded-xl bg-neutral-100 p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-lg hover:bg-white hover:shadow-sm"
                >
                  -
                </Button>
                <div className="flex-1 text-center font-display text-lg font-bold">{quantity}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= 10}
                  className="h-10 w-10 rounded-lg hover:bg-white hover:shadow-sm"
                >
                  +
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">Lịch sắp tới</label>
              <div className="space-y-2">
                {openSchedules.slice(0, 3).map((schedule) => {
                  const remaining = schedule.capacity - schedule.bookedCount;
                  return (
                    <button
                      key={schedule.id}
                      className="group w-full rounded-xl border border-neutral-200 p-3 text-left transition-all hover:border-brand-500 hover:bg-brand-50/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => handleAddToCart(schedule)}
                      disabled={remaining < quantity}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-bold text-gray-900 group-hover:text-brand-700">
                          {formatDate(schedule.startDate)}
                        </span>
                        <span className="font-black text-brand-600">
                          {formatCurrency(schedule.price * quantity)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>Còn {remaining} chỗ</span>
                        <span>Tổng tiền ({quantity} khách)</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-4">
              <Link href="/cart" prefetch={false}>
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-xl border-2 font-bold hover:bg-neutral-50 hover:text-brand-600"
                >
                  Xem giỏ hàng
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-center text-white shadow-lg">
        <p className="mb-2 text-lg font-bold">Cần tư vấn thêm?</p>
        <p className="mb-4 text-sm text-brand-100">
          Liên hệ với chúng tôi để được giải đáp thắc mắc về lịch trình.
        </p>
        <a
          href="tel:0912946549"
          className="inline-block rounded-xl bg-white px-6 py-3 font-bold text-brand-700 transition-colors hover:bg-brand-50"
        >
          Alo ngay: 0912 946 549
        </a>
      </div>
    </>
  );
}
