'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TicketTier } from '@/types/api.types';
import { ticketService } from '@/services/ticket.service';
import { bookingService } from '@/services/booking.service';
import { formatCurrency } from '@/lib/utils';
import {
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Ticket,
  Check,
  Sparkles,
  Tag,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart.store';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/lib/utils';
interface ExtendedTicketTier extends TicketTier {
  originalPrice?: number;
  maxRegistrations?: number;
}
export default function TicketsPage() {
  usePageTitle();
  const router = useRouter();
  const addTicketTier = useCartStore((state) => state.addTicketTier);
  const [tiers, setTiers] = useState<ExtendedTicketTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [bookingLoading, setBookingLoading] = useState(false);
  useEffect(() => {
    fetchTiers();
  }, []);
  const fetchTiers = async () => {
    try {
      const tiersData = await ticketService.getTiers();
      if (tiersData) {
        setTiers(tiersData);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách vé');
    } finally {
      setLoading(false);
    }
  };
  const updateQuantity = (tierId: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[tierId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [tierId]: next };
    });
  };
  const totalPrice = tiers.reduce((sum, tier) => {
    return sum + (quantities[tier.id] || 0) * tier.price;
  }, 0);
  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
  const handleAddToCart = () => {
    if (totalItems === 0) {
      toast.error('Vui lòng chọn ít nhất 1 vé');
      return;
    }
    Object.entries(quantities).forEach(([tierId, qty]) => {
      if (qty > 0) {
        const tier = tiers.find((t) => t.id === Number(tierId));
        if (tier) {
          addTicketTier({
            tierId: tier.id,
            tierName: tier.name,
            price: tier.price,
            quantity: qty,
          });
        }
      }
    });
    toast.success(`Đã thêm ${totalItems} vé vào giỏ hàng!`, { duration: 800 });
    setQuantities({});
  };
  const handleBuyNow = async () => {
    if (totalItems === 0) {
      toast.error('Vui lòng chọn ít nhất 1 vé');
      return;
    }
    setBookingLoading(true);
    try {
      const ticketTiers = Object.entries(quantities)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => ({
          tierId: Number(id),
          quantity: qty,
        }));
      const newBooking = await bookingService.createBooking({ ticketTiers });
      if (newBooking) {
        toast.success('Đặt vé thành công!');
        router.push(`/checkout?code=${newBooking.bookingCode}`);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi đặt vé';
      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-neutral-50 pb-32 font-sans selection:bg-brand-100">
      <div className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-70"></div>
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-brand-400/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl"></div>

        <div className="container relative z-10 mx-auto px-4 pb-12 pt-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-1.5 text-sm font-semibold text-brand-600 shadow-sm duration-500 animate-in fade-in zoom-in">
            <Sparkles className="h-4 w-4 fill-brand-100" />
            <span>Vé Chính Hãng & Dịch Vụ 5 Sao</span>
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Trải Nghiệm{' '}
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              Tuyệt Vời Nhất
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
            Chọn hạng vé phù hợp để tận hưởng trọn vẹn không gian âm nhạc đẳng cấp. Ưu đãi đặc biệt
            khi đặt vé sớm.
          </p>
        </div>
      </div>

      <div className="container relative z-20 mx-auto -mt-6 px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => {
            const hasDiscount = tier.originalPrice && tier.originalPrice > tier.price;
            const discountPercent = hasDiscount
              ? Math.round(((tier.originalPrice! - tier.price) / tier.originalPrice!) * 100)
              : 0;
            const benefitsList = tier.benefits
              ? tier.benefits.split('\n').filter((line) => line.trim().length > 0)
              : [];
            const shadowColor = tier.colorCode ? `${tier.colorCode}20` : '#00000010';
            return (
              <div
                key={tier.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  boxShadow: `0 4px 6px -1px ${shadowColor}, 0 2px 4px -1px ${shadowColor}`,
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5 w-full"
                  style={{ backgroundColor: tier.colorCode || '#3b82f6' }}
                />

                <div className="relative flex flex-1 flex-col p-6">
                  {hasDiscount && (
                    <div className="absolute right-4 top-4 duration-300 animate-in fade-in zoom-in">
                      <div className="flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-600 shadow-sm">
                        <Tag className="h-3 w-3 fill-current" />
                        <span>-{discountPercent}%</span>
                      </div>
                    </div>
                  )}

                  <div className="mb-6 pr-12">
                    <h3 className="text-xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-brand-600">
                      {tier.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-[40px] text-sm text-gray-500">
                      {tier.description || 'Vé tham dự sự kiện tiêu chuẩn.'}
                    </p>
                  </div>

                  <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50/50 p-5 transition-colors duration-300 group-hover:border-brand-100 group-hover:bg-brand-50/30">
                    <div className="flex flex-col items-center text-center">
                      {hasDiscount && (
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Giá gốc
                          </span>
                          <span className="text-sm font-medium text-gray-400 line-through decoration-gray-400">
                            {formatCurrency(tier.originalPrice!)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-gray-900 transition-colors group-hover:text-brand-700">
                          {new Intl.NumberFormat('vi-VN').format(tier.price)}
                        </span>
                        <span className="text-base font-bold text-gray-500 group-hover:text-brand-600">
                          ₫
                        </span>
                      </div>
                      <div className="mt-1 text-xs font-medium text-gray-400">
                        Bao gồm thuế & phí
                      </div>
                    </div>
                  </div>

                  {benefitsList.length > 0 && (
                    <div className="flex-1">
                      <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <Info className="h-4 w-4" /> Quyền lợi
                      </h4>
                      <ul className="space-y-3">
                        {benefitsList.map((benefit, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-sm text-gray-600 transition-colors group-hover:text-gray-900"
                          >
                            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-50">
                              <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
                            </div>
                            <span className="pt-0.5 leading-snug">
                              {benefit.replace(/^[•-]\s*/, '')}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 bg-gray-50/50 p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex w-[120px] items-center justify-between rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100"
                        onClick={() => updateQuantity(tier.id, -1)}
                        disabled={!quantities[tier.id]}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="min-w-[20px] text-center text-base font-bold text-gray-900">
                        {quantities[tier.id] || 0}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-md text-brand-600 hover:bg-brand-50 hover:text-brand-700"
                        onClick={() => updateQuantity(tier.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1 text-right">
                      {(quantities[tier.id] || 0) > 0 ? (
                        <div className="duration-200 animate-in slide-in-from-right-2">
                          <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Tổng
                          </div>
                          <div className="text-lg font-bold leading-none text-brand-600">
                            {formatCurrency((quantities[tier.id] || 0) * tier.price)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm italic text-gray-400">Chưa chọn vé</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-500 ease-in-out',
          totalItems > 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 h-32 bg-gradient-to-t from-white via-white to-transparent"></div>

        <div className="container mx-auto max-w-5xl px-4 pb-6 pt-2">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-gray-900 bg-opacity-95 p-4 text-white shadow-2xl backdrop-blur-xl md:flex-row md:p-5">
            <div className="flex w-full items-center justify-between gap-6 md:w-auto md:justify-start">
              <div className="flex flex-col">
                <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Đã chọn {totalItems} vé
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="bg-gradient-to-r from-brand-200 to-white bg-clip-text text-2xl font-bold text-transparent">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="hidden h-10 w-px bg-gray-700 md:block"></div>

              <div className="hidden flex-col md:flex">
                <span className="text-xs font-medium text-gray-400">Bạn đã tiết kiệm được</span>
                <span className="text-sm font-bold text-green-400">Ưu đãi tốt nhất</span>
              </div>
            </div>

            <div className="flex w-full gap-3 md:w-auto">
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToCart}
                className="flex-1 border-gray-600 text-gray-300 transition-colors hover:border-gray-500 hover:bg-gray-800 hover:text-white md:flex-none"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Thêm giỏ hàng</span>
                <span className="sm:hidden">Thêm</span>
              </Button>

              <Button
                size="lg"
                onClick={handleBuyNow}
                disabled={bookingLoading}
                className="flex-1 transform bg-white px-8 font-bold text-gray-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] md:flex-none"
              >
                {bookingLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Ticket className="mr-2 h-5 w-5" />
                )}
                MUA NGAY
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-32"></div>
    </div>
  );
}
