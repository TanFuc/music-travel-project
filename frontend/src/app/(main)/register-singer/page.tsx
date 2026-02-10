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
    // Add to cart then checkout flow
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
      <div className="container mx-auto px-4 pt-12 relative z-20">
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

        {/* Packages Grid - Optimized Layout */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {packages?.map((pkg: any, index: number) => {
            const colorThemes = [
              { border: 'border-blue-100', bgIcon: 'bg-blue-50', textIcon: 'text-blue-600', shadow: '#3b82f6', gradient: 'from-blue-50/50 to-white' },
              { border: 'border-purple-100', bgIcon: 'bg-purple-50', textIcon: 'text-purple-600', shadow: '#a855f7', gradient: 'from-purple-50/50 to-white' },
              { border: 'border-amber-100', bgIcon: 'bg-amber-50', textIcon: 'text-amber-600', shadow: '#f59e0b', gradient: 'from-amber-50/50 to-white' }
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
                className="group relative bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>

                {/* Active Selection Border */}
                {currentQty > 0 && (
                  <div className="absolute inset-0 border-[3px] border-brand-500 rounded-3xl pointer-events-none z-20 transition-all duration-300 animate-in fade-in"></div>
                )}

                <div className="p-6 md:p-8 flex-1 flex flex-col relative z-10">
                  {/* Availability Badge */}
                  {pkg.maxRegistrations && pkg._count && (
                    <div className="absolute top-6 right-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-sm z-20">
                      <Users className="w-3.5 h-3.5" />
                      <span>{pkg.maxRegistrations - pkg._count.registrations}/{pkg.maxRegistrations}</span>
                    </div>
                  )}

                  {/* Header Section */}
                  <div className="mb-6 pr-2">
                    <div className={`w-14 h-14 rounded-2xl ${theme.bgIcon} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${theme.textIcon}`} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight mb-3 min-h-[3.5rem] line-clamp-2" title={pkg.name}>
                      {pkg.name}
                    </h3>

                    {/* Tags/Badges Flow - Fix Overlapping */}
                    <div className="flex flex-wrap gap-2">
                      {hasDiscount && (
                        <div className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                          <Tag className="w-3 h-3 fill-current" />
                          <span>Tiết kiệm {discountPercent}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Card */}
                  <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 mb-8 border border-gray-100 shadow-inner hover:border-brand-200 transition-colors">
                    <div className="flex flex-col">
                      {hasDiscount && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Giá gốc</span>
                          <span className="text-sm text-gray-400 font-medium line-through decoration-gray-400">
                            {formatCurrency(pkg.originalPrice)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight group-hover:text-brand-600 transition-colors">
                          {formatCurrency(pkg.price).replace(/\s?₫/, '')}
                        </span>
                        <span className="text-xl font-bold text-gray-400">₫</span>
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  {pkg.benefits && pkg.benefits.length > 0 && (
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100/50">
                        <div className="p-1 rounded bg-brand-50">
                          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Quyền lợi đặc biệt</span>
                      </div>
                      <ul className="space-y-3.5">
                        {pkg.benefits.map((benefit: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-gray-700 leading-relaxed group/item">
                            <div className="mt-1 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 border border-green-100 group-hover/item:bg-green-100 transition-colors">
                              <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                            </div>
                            <span className="pt-0.5">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Card Footer Control - Clean Quantity Selector */}
                <div className="p-4 mt-auto z-10">
                  <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 transition-colors hover:bg-white/90 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center bg-white rounded-xl p-1 border border-gray-200 shadow-sm w-[130px] justify-between">
                        <Button variant="ghost" size="sm" className="h-10 w-10 rounded-lg hover:bg-gray-100" onClick={() => handleQuantityChange(pkg.id, -1)} disabled={!currentQty}>
                          <Minus className="h-4 w-4 text-gray-600" />
                        </Button>
                        <span className="font-bold text-gray-900 text-lg min-w-[24px] text-center">{currentQty}</span>
                        <Button variant="ghost" size="sm" className="h-10 w-10 rounded-lg hover:bg-brand-50 text-brand-600" onClick={() => handleQuantityChange(pkg.id, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex-1 text-right h-10 flex flex-col justify-center">
                        {currentQty > 0 ? (
                          <div className="animate-in slide-in-from-right-4 duration-300">
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Thành tiền</div>
                            <div className="text-xl font-black text-brand-600 leading-none">
                              {formatCurrency(currentQty * pkg.price)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-gray-400 flex items-center justify-end gap-2">
                            <span>Chọn số lượng</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse"></span>
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
