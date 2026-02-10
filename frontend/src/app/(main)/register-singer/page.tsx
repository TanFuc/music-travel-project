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
  Heart,
  Star,
  Crown,
  Users,
  Video,
  Info,
  Tag,
  Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bookingService } from '@/services/booking.service';

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

  const { data: packages, isLoading: packagesLoading, error: packagesError } = useQuery({
    queryKey: ['singer-packages-active'],
    queryFn: singerPackageService.getActivePackages,
    staleTime: 5 * 60 * 1000,
  });

  const handleQuantityChange = (packageId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[packageId] || 0;
      const next = Math.max(0, current + delta);
      if (next > 10) return prev; // Max check
      return { ...prev, [packageId]: next };
    });
  };

  // Calculate totals from SELECTION (not cart)
  const { totalItems, totalPrice } = useMemo(() => {
    if (!packages) return { totalItems: 0, totalPrice: 0 };
    let items = 0;
    let price = 0;

    Object.entries(quantities).forEach(([id, qty]) => {
      const pkg = packages.find((p: any) => p.id === id); // id matches
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
    setQuantities({}); // Reset selection
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
    // Note: Singer packages might need specific booking flow or just add to cart + checkout
    // If we want "Buy Now" to act like Tickets Page (create booking directly), we need an API for it.
    // Logic: Add to cart -> Redirect Checkout
    // Or: Call createBooking with singer items.

    // For now, let's mimic Tickets Page "Buy Now": 
    // 1. If backend supports direct booking of singer packages via similar payload?
    // BookingService.createBooking({ ticketTiers: [...] }). Does it support singer packages?
    // Looking at BookingDto, it might not verify "ticketTiers" vs "singerPackages".
    // Let's use the safer approach: Add to Cart -> Redirect Checkout

    // Actually, let's check booking.service.ts or backend logic.
    // Assuming we add to cart then go to checkout is safer for now if API structure isn't confirmed.

    // UPDATE: Tickets Page calls `bookingService.createBooking` with `ticketTiers`.
    // Singer Packages are different items. The backend might allow mixed items or different payload.
    // Let's stick to "Add + Checkout" flow for safety, OR if we want to be consistent: 
    // Just implement handleAddToCart logic then push router.

    handleAddToCart(); // Add to global store
    router.push('/checkout'); // Redirect
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
      {/* Immersive Header */}
      <div className="relative bg-white overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-emerald-50/50 opacity-70"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 pt-16 pb-12 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-100 shadow-sm rounded-full text-green-600 text-sm font-semibold mb-6 animate-in fade-in zoom-in duration-500">
            <Mic className="w-4 h-4 fill-green-100" />
            <span>Trải Nghiệm Sân Khấu Chuyên Nghiệp</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Đăng Ký <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Ca Sĩ Biểu Diễn</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Cơ hội tỏa sáng trên sân khấu "Mãi cho Hành Tinh Xanh".
            Được đào tạo, tập luyện cùng ban nhạc và lưu giữ khoảnh khắc đáng nhớ.
          </p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="container mx-auto px-4 py-12 relative z-20">
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Video, text: "Sân khấu & Ban nhạc Live", color: "text-purple-600", bg: "bg-purple-50" },
            { icon: Star, text: "TVC Cá nhân 4K", color: "text-amber-600", bg: "bg-amber-50" },
            { icon: Music, text: "Đào tạo Thanh nhạc", color: "text-blue-600", bg: "bg-blue-50" },
            { icon: Users, text: "Kết nối Cộng đồng", color: "text-green-600", bg: "bg-green-50" },
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`p-3 rounded-full ${feature.bg}`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <span className="font-semibold text-gray-800">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Packages Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {packages?.map((pkg: any, index: number) => {
            const colorThemes = [
              { border: 'border-blue-100', bgIcon: 'bg-blue-50', textIcon: 'text-blue-600', shadow: '#3b82f6' },
              { border: 'border-purple-100', bgIcon: 'bg-purple-50', textIcon: 'text-purple-600', shadow: '#a855f7' },
              { border: 'border-amber-100', bgIcon: 'bg-amber-50', textIcon: 'text-amber-600', shadow: '#f59e0b' }
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
                className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                style={{
                  boxShadow: `0 4px 6px -1px ${theme.shadow}20, 0 2px 4px -1px ${theme.shadow}10`
                }}
              >
                {/* Active Selection Border */}
                {currentQty > 0 && (
                  <div className="absolute inset-0 border-2 border-brand-500 rounded-2xl pointer-events-none z-10 transition-all duration-300 animate-in fade-in"></div>
                )}

                <div className="p-6 flex-1 flex flex-col relative">
                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                      <div className="bg-red-50 text-red-600 border border-red-100 shadow-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                        <Tag className="w-3 h-3 fill-current" />
                        <span>-{discountPercent}%</span>
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${theme.bgIcon}`}>
                      <Icon className={`w-6 h-6 ${theme.textIcon}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {pkg.name}
                    </h3>
                  </div>

                  {/* Availability */}
                  {pkg.maxRegistrations && pkg._count && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md w-fit">
                      <Users className="w-4 h-4" />
                      <span>Còn lại: <span className="font-bold text-gray-900">{pkg.maxRegistrations - pkg._count.registrations}</span>/{pkg.maxRegistrations} suất</span>
                    </div>
                  )}

                  {/* Price Card */}
                  <div className="bg-gray-50/80 rounded-xl p-5 mb-6 border border-gray-100 group-hover:bg-brand-50/20 transition-colors">
                    <div className="flex flex-col items-center text-center">
                      {hasDiscount && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Giá gốc</span>
                          <span className="text-sm text-gray-400 font-medium line-through decoration-gray-400">
                            {formatCurrency(pkg.originalPrice)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-gray-900 group-hover:text-brand-700 transition-colors">
                          {formatCurrency(pkg.price).replace(/\s?₫/, '')}
                        </span>
                        <span className="text-base font-bold text-gray-500 group-hover:text-brand-600">₫</span>
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  {pkg.benefits && pkg.benefits.length > 0 && (
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Quyền lợi
                      </h4>
                      <ul className="space-y-3">
                        {pkg.benefits.map((benefit: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                            <div className="mt-0.5 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                            </div>
                            <span className="leading-snug pt-0.5">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Card Footer Control - Clean Quantity Selector */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-[120px] justify-between">
                      <Button variant="ghost" size="sm" className="h-9 w-9" onClick={() => handleQuantityChange(pkg.id, -1)} disabled={!currentQty}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-gray-900 min-w-[20px] text-center">{currentQty}</span>
                      <Button variant="ghost" size="sm" className="h-9 w-9 text-brand-600" onClick={() => handleQuantityChange(pkg.id, 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 text-right">
                      {currentQty > 0 ? (
                        <div className="animate-in slide-in-from-right-2 duration-200">
                          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Tổng</div>
                          <div className="text-lg font-bold text-brand-600 leading-none">
                            {formatCurrency(currentQty * pkg.price)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Chưa chọn</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Sticky Bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out transform",
          totalItems > 0 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}
      >
        {/* Gradient fade above bar */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white to-transparent -z-10 pointer-events-none"></div>

        <div className="container mx-auto px-4 pb-6 pt-2 max-w-5xl">
          <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-800 backdrop-blur-xl bg-opacity-95">
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Đã chọn {totalItems} gói</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-200 to-white">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Divider for desktop */}
              <div className="hidden md:block w-px h-10 bg-gray-700"></div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToCart}
                className="flex-1 md:flex-none border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 hover:border-gray-500 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Thêm giỏ hàng</span>
                <span className="sm:hidden">Thêm</span>
              </Button>

              <Button
                size="lg"
                onClick={handleBuyNow}
                className="flex-1 md:flex-none bg-white text-gray-900 hover:bg-brand-50 font-bold px-8 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all transform hover:-translate-y-0.5"
              >
                {bookingLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Ticket className="w-5 h-5 mr-2" />
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
