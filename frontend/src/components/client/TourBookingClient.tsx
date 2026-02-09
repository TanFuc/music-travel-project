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
      {/* Sidebar Booking Widget */}
      <div className="bg-white rounded-3xl p-6 shadow-xl shadow-brand-500/10 border border-brand-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
            <Ticket className="h-5 w-5" />
          </div>
          <h3 className="font-display font-bold text-xl text-gray-900">Đặt tour ngay</h3>
        </div>

        {openSchedules.length === 0 ? (
          <div className="text-center py-6 bg-neutral-50 rounded-2xl">
            <p className="text-sm text-neutral-500">Hiện tại không có lịch khởi hành.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 flex justify-between">
                Số lượng khách
                <span className="text-brand-600 font-normal">{quantity} người</span>
              </label>
              <div className="flex items-center p-1 bg-neutral-100 rounded-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-lg hover:bg-white hover:shadow-sm"
                >
                  -
                </Button>
                <div className="flex-1 text-center font-display font-bold text-lg">{quantity}</div>
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

            {/* Quick Schedule Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">Lịch sắp tới</label>
              <div className="space-y-2">
                {openSchedules.slice(0, 3).map((schedule) => {
                  const remaining = schedule.capacity - schedule.bookedCount;
                  return (
                    <button
                      key={schedule.id}
                      className="w-full group p-3 border border-neutral-200 rounded-xl text-left hover:border-brand-500 hover:bg-brand-50/50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleAddToCart(schedule)}
                      disabled={remaining < quantity}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900 group-hover:text-brand-700">
                          {formatDate(schedule.startDate)}
                        </span>
                        <span className="text-brand-600 font-black">
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

            <div className="pt-4 border-t border-neutral-100">
              <Link href="/cart" prefetch={false}>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl font-bold border-2 hover:bg-neutral-50 hover:text-brand-600"
                >
                  Xem giỏ hàng
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Support Card */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 text-white text-center shadow-lg">
        <p className="font-bold text-lg mb-2">Cần tư vấn thêm?</p>
        <p className="text-brand-100 text-sm mb-4">
          Liên hệ với chúng tôi để được giải đáp thắc mắc về lịch trình.
        </p>
        <a
          href="tel:0912946549"
          className="inline-block bg-white text-brand-700 px-6 py-3 rounded-xl font-bold hover:bg-brand-50 transition-colors"
        >
          Alo ngay: 0912 946 549
        </a>
      </div>
    </>
  );
}
