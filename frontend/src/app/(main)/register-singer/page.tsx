'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { singerPackageService } from '@/services/singer-packages.service';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  Sparkles,
  Mic,
  Music,
  Star,
  Crown,
  Users,
  Video,
  Tag,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
interface SingerPackage {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description?: string;
  benefits?: string[];
  maxRegistrations?: number;
  _count?: {
    registrations: number;
  };
}
export default function RegisterSingerPage() {
  usePageTitle();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addSingerPackage } = useCartStore();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [bookingLoading, setBookingLoading] = useState(false);
  const {
    data: packages,
    isLoading: packagesLoading,
    error: packagesError,
  } = useQuery({
    queryKey: ['singer-packages-active'],
    queryFn: singerPackageService.getActivePackages,
    staleTime: 5 * 60 * 1000,
  });
  const handleQuantityChange = (packageId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[packageId] || 0;
      const next = Math.max(0, current + delta);
      if (next > 10) return prev;
      return { ...prev, [packageId]: next };
    });
  };
  const { totalItems, totalPrice } = useMemo(() => {
    if (!packages) return { totalItems: 0, totalPrice: 0 };
    let items = 0;
    let price = 0;
    Object.entries(quantities).forEach(([id, qty]) => {
      const pkg = packages.find((p: any) => p.id === id);
      if (pkg && qty > 0) {
        items += qty;
        price += pkg.price * qty;
      }
    });
    return { totalItems: items, totalPrice: price };
  }, [quantities, packages]);
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      router.push('/login?redirect=/register-singer');
      return;
    }
    if (totalItems === 0) {
      toast.error('Vui lòng chọn ít nhất 1 gói');
      return;
    }
    Object.entries(quantities).forEach(([id, qty]) => {
      if (qty > 0) {
        const pkg = packages?.find((p: any) => p.id === id);
        if (pkg) {
          addSingerPackage({
            packageId: pkg.id,
            packageName: pkg.name,
            price: pkg.price,
            quantity: qty,
            description: pkg.description,
            benefits: pkg.benefits,
          });
        }
      }
    });
    toast.success(`Đã thêm ${totalItems} gói dịch vụ vào giỏ hàng`);
    setQuantities({});
  };
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua');
      router.push('/login?redirect=/register-singer');
      return;
    }
    if (totalItems === 0) {
      toast.error('Vui lòng chọn ít nhất 1 gói');
      return;
    }
    setBookingLoading(true);
    handleAddToCart();
    router.push('/checkout');
  };
  if (packagesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }
  if (packagesError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-red-600">
        Không thể tải thông tin gói đăng ký.
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-neutral-50 pb-32 font-sans selection:bg-brand-100">
      <div className="relative overflow-hidden border-b border-gray-100 bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-emerald-50/50 opacity-70"></div>
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-green-400/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl"></div>

        <div className="container relative z-10 mx-auto px-4 pb-12 pt-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-1.5 text-sm font-semibold text-green-600 shadow-sm duration-500 animate-in fade-in zoom-in">
            <Mic className="h-4 w-4 fill-green-100" />
            <span>Trải Nghiệm Sân Khấu Chuyên Nghiệp</span>
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Kết Nối{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Tài Năng & Nghệ Thuật
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
            Cơ hội tỏa sáng trên sân khấu sinh thái "Mãi cho Hành Tinh Xanh". Cùng chúng tôi lan tỏa
            thông điệp bảo vệ môi trường qua những giai điệu cảm xúc giữa thiên nhiên hùng vĩ.
          </p>
        </div>
      </div>

      <div className="container relative z-20 mx-auto px-4 pt-12">
        <div className="mb-16 grid gap-6 md:grid-cols-4">
          {[
            {
              icon: Video,
              text: 'Sân khấu & Ban nhạc Live',
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            { icon: Star, text: 'TVC Cá nhân 4K', color: 'text-amber-600', bg: 'bg-amber-50' },
            { icon: Music, text: 'Đào tạo Thanh nhạc', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Users, text: 'Kết nối Cộng đồng', color: 'text-green-600', bg: 'bg-green-50' },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`rounded-full p-3 ${feature.bg}`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <span className="font-semibold text-gray-800">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {packages?.map((pkg: any, index: number) => {
            const colorThemes = [
              {
                border: 'border-blue-100',
                bgIcon: 'bg-blue-50',
                textIcon: 'text-blue-600',
                shadow: '#3b82f6',
                gradient: 'from-blue-50/50 to-white',
              },
              {
                border: 'border-purple-100',
                bgIcon: 'bg-purple-50',
                textIcon: 'text-purple-600',
                shadow: '#a855f7',
                gradient: 'from-purple-50/50 to-white',
              },
              {
                border: 'border-amber-100',
                bgIcon: 'bg-amber-50',
                textIcon: 'text-amber-600',
                shadow: '#f59e0b',
                gradient: 'from-amber-50/50 to-white',
              },
            ];
            const theme = colorThemes[index % colorThemes.length];
            const Icon = [Star, Crown, Sparkles][index % 3];
            const hasDiscount = pkg.originalPrice && pkg.originalPrice > pkg.price;
            const discountPercent = hasDiscount
              ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
              : 0;
            const currentQty = quantities[pkg.id] || 0;
            return (
              <div
                key={pkg.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} pointer-events-none opacity-50 transition-opacity group-hover:opacity-100`}
                ></div>

                {currentQty > 0 && (
                  <div className="pointer-events-none absolute inset-0 z-20 rounded-3xl border-[3px] border-brand-500 transition-all duration-300 animate-in fade-in"></div>
                )}

                <div className="relative z-10 flex flex-1 flex-col p-6 md:p-8">
                  {pkg.maxRegistrations && pkg._count && (
                    <div className="absolute right-6 top-6 z-20 flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 shadow-sm backdrop-blur-sm">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {pkg.maxRegistrations - pkg._count.registrations}/{pkg.maxRegistrations}
                      </span>
                    </div>
                  )}

                  <div className="mb-6 pr-2">
                    <div
                      className={`h-14 w-14 rounded-2xl ${theme.bgIcon} mb-4 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`h-7 w-7 ${theme.textIcon}`} />
                    </div>
                    <h3
                      className="mb-3 line-clamp-2 min-h-[3.5rem] text-xl font-extrabold leading-tight text-gray-900 md:text-2xl"
                      title={pkg.name}
                    >
                      {pkg.name}
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {hasDiscount && (
                        <div className="flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-red-600">
                          <Tag className="h-3 w-3 fill-current" />
                          <span>Tiết kiệm {discountPercent}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-8 rounded-2xl border border-gray-100 bg-white/60 p-5 shadow-inner backdrop-blur-md transition-colors hover:border-brand-200">
                    <div className="flex flex-col">
                      {hasDiscount && (
                        <div className="mb-1 flex items-center gap-2">
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-500">
                            Giá gốc
                          </span>
                          <span className="text-sm font-medium text-gray-400 line-through decoration-gray-400">
                            {formatCurrency(pkg.originalPrice)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black tracking-tight text-gray-900 transition-colors group-hover:text-brand-600 md:text-4xl">
                          {formatCurrency(pkg.price).replace(/\s?₫/, '')}
                        </span>
                        <span className="text-xl font-bold text-gray-400">₫</span>
                      </div>
                    </div>
                  </div>

                  {pkg.benefits && pkg.benefits.length > 0 && (
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-100/50 pb-2">
                        <div className="rounded bg-brand-50 p-1">
                          <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                          Quyền lợi đặc biệt
                        </span>
                      </div>
                      <ul className="space-y-3.5">
                        {pkg.benefits.map((benefit: string, idx: number) => (
                          <li
                            key={idx}
                            className="group/item flex items-start gap-3 text-sm leading-relaxed text-gray-700 md:text-base"
                          >
                            <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-green-100 bg-green-50 transition-colors group-hover/item:bg-green-100">
                              <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
                            </div>
                            <span className="pt-0.5">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="z-10 mt-auto p-4">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/90">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex w-[130px] items-center justify-between rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 rounded-lg hover:bg-gray-100"
                          onClick={() => handleQuantityChange(pkg.id, -1)}
                          disabled={!currentQty}
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </Button>
                        <span className="min-w-[24px] text-center text-lg font-bold text-gray-900">
                          {currentQty}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 rounded-lg text-brand-600 hover:bg-brand-50"
                          onClick={() => handleQuantityChange(pkg.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex h-10 flex-1 flex-col justify-center text-right">
                        {currentQty > 0 ? (
                          <div className="duration-300 animate-in slide-in-from-right-4">
                            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Thành tiền
                            </div>
                            <div className="text-xl font-black leading-none text-brand-600">
                              {formatCurrency(currentQty * pkg.price)}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 text-sm font-medium text-gray-400">
                            <span>Chọn số lượng</span>
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-300"></span>
                          </div>
                        )}
                      </div>
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-white via-white to-transparent"></div>

        <div className="container mx-auto max-w-5xl px-4 pb-6 pt-2">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-gray-900 bg-opacity-95 p-4 text-white shadow-2xl backdrop-blur-xl md:flex-row md:p-5">
            <div className="flex w-full items-center justify-between gap-6 md:w-auto md:justify-start">
              <div className="flex flex-col">
                <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Đã chọn {totalItems} gói
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="bg-gradient-to-r from-brand-200 to-white bg-clip-text text-2xl font-bold text-transparent">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="hidden h-10 w-px bg-gray-700 md:block"></div>
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
