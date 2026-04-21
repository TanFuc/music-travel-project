'use client';
import { useState } from 'react';
import { Users, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
interface TourSchedulesClientProps {
  tourId: number;
  tourTitle: string;
  schedules: TourSchedule[];
}
const scheduleStatusColors: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'success' | 'warning'
> = {
  OPEN: 'success',
  CLOSED: 'secondary',
  CANCELLED: 'destructive',
};
const scheduleStatusLabels: Record<string, string> = {
  OPEN: 'Còn chỗ',
  CLOSED: 'Đã đóng',
  CANCELLED: 'Đã hủy',
};
export function TourSchedulesClient({ tourId, tourTitle, schedules }: TourSchedulesClientProps) {
  const addTour = useCartStore((state) => state.addTour);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const handleAddToCart = (schedule: TourSchedule) => {
    addTour({
      scheduleId: schedule.id,
      tourId,
      tourTitle,
      startDate: schedule.startDate,
      price: schedule.price,
      quantity: 1,
    });
    toast.success('Đã thêm tour vào giỏ hàng!');
    setSelectedSchedule(schedule.id);
    setTimeout(() => setSelectedSchedule(null), 1000);
  };
  return (
    <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="mb-6 flex items-center gap-2 font-display text-xl font-bold">
        <span className="text-2xl">📅</span> Lịch khởi hành
      </h3>

      {schedules.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 py-10 text-center">
          <p className="text-neutral-500">Chưa có lịch khởi hành cho tour này.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {schedules.map((schedule) => {
            const remaining = schedule.capacity - schedule.bookedCount;
            const isAvailable = schedule.status === 'OPEN' && remaining > 0;
            return (
              <div
                key={schedule.id}
                className={`group flex items-center justify-between rounded-2xl border p-4 transition-all ${
                  selectedSchedule === schedule.id
                    ? 'border-brand-500 bg-brand-50 shadow-md ring-1 ring-brand-500'
                    : 'border-neutral-200 hover:border-brand-300 hover:shadow-sm'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-bold text-gray-900">
                      {formatDate(schedule.startDate)}
                    </span>
                    <Badge variant={scheduleStatusColors[schedule.status]} className="rounded-md">
                      {scheduleStatusLabels[schedule.status]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span className={remaining < 5 ? 'font-bold text-orange-500' : ''}>
                        Còn {remaining} chỗ
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-bold text-brand-600">
                        {formatCurrency(schedule.price)}
                      </span>
                      /khách
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={!isAvailable}
                  onClick={() => handleAddToCart(schedule)}
                  className={`rounded-xl font-bold transition-all ${selectedSchedule === schedule.id ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  {!isAvailable
                    ? 'Hết chỗ'
                    : selectedSchedule === schedule.id
                      ? 'Đã thêm ✓'
                      : 'Đặt ngay'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
