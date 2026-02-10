'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Heart, Mic, Music, Star, Users, Video, Crown, ShoppingCart, Plus, Minus } from 'lucide-react';
import { singerPackageService } from '@/services/singer-packages.service';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart.store';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function RegisterSingerPage() {
  usePageTitle();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { singerPackages: cartItems, addSingerPackage, removeSingerPackage } = useCartStore();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Fetch active packages
  const { data: packages, isLoading: packagesLoading, error: packagesError } = useQuery({
    queryKey: ['singer-packages-active'],
    queryFn: singerPackageService.getActivePackages,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle quantity change
  const handleQuantityChange = (packageId: string, increment: boolean) => {
    setQuantities(prev => {
      const currentQty = prev[packageId] || 1;
      const newQty = increment ? Math.min(currentQty + 1, 10) : Math.max(currentQty - 1, 1);
      return { ...prev, [packageId]: newQty };
    });
  };

  // Check if package is in cart
  const getPackageInCart = (packageId: string) => {
    return cartItems.find(item => item.packageId === packageId);
  };

  // Handle add to cart
  const handleAddToCart = (pkg: any) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      router.push('/login?redirect=/register-singer');
      return;
    }

    const quantity = quantities[pkg.id] || 1;
    addSingerPackage({
      packageId: pkg.id,
      packageName: pkg.name,
      price: pkg.price,
      quantity,
      description: pkg.description,
      benefits: pkg.benefits,
    });

    toast.success(`Đã thêm ${quantity} gói "${pkg.name}" vào giỏ hàng`);
    
    // Reset quantity to 1 after adding
    setQuantities(prev => ({ ...prev, [pkg.id]: 1 }));
  };

  // Calculate total cart amount
  const getTotalCartAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate total cart items
  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Handle checkout
  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section with Program Content */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6">
              <Music className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
              <Mic className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight px-4">
              ĐĂNG KÝ LÀM CA SĨ
            </h1>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-green-600 mb-2 px-4">
              TRỞ THÀNH CA SĨ BIỂU DIỄN
            </h2>
            <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-gray-700 px-4">
              TRONG CHUỖI ĐÊM NHẠC MÃI CHO HÀNH TINH XANH
            </h3>
          </div>

          {/* Program Introduction */}
          <Card className="mb-8 md:mb-12 border-green-200 shadow-xl">
            <CardContent className="p-4 md:p-8">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Bạn yêu ca hát? Bạn từng ước một lần đứng trên sân khấu thật, hát cùng ban nhạc thật?
                  Bạn muốn lưu giữ dấu ấn cá nhân bằng âm nhạc – hình ảnh – cảm xúc?
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>"Mãi cho Hành Tinh Xanh"</strong> mở ra chương trình đăng ký làm "Ca sĩ biểu diễn",
                  nơi bạn không cần là ca sĩ chuyên nghiệp, chỉ cần đam mê và mong muốn trải nghiệm nghiêm túc.
                </p>
                <p className="text-gray-700 leading-relaxed mb-8">
                  Đây là hành trình đào tạo – đồng hành – biểu diễn thật trong không gian âm nhạc xanh, nhân văn,
                  gắn với cộng đồng doanh nhân – chủ cửa hàng – người yêu nghệ thuật.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span>Đào tạo thanh nhạc bài bản (từ cơ bản đến nâng cao)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span>Tập luyện, phối nhạc, ghép ban nhạc live</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span>Biểu diễn trực tiếp trên sân khấu Đêm nhạc</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span>Ghi hình – hậu kỳ – dựng TVC cá nhân</span>
                  </div>
                  <div className="flex items-start gap-3 md:col-span-2">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span>Kết nối cộng đồng cùng giá trị sống xanh – kinh doanh tử tế</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Information */}
          {packagesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
              {[1, 2].map((i) => (
                <Card key={i} className="border-gray-200 shadow-lg">
                  <CardHeader className="bg-gray-50 rounded-t-lg">
                    <div className="h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="space-y-2 mt-4">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="h-3 bg-gray-100 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : packagesError ? (
            <div className="text-center py-8 mb-8">
              <p className="text-red-600">Không thể tải thông tin gói đăng ký. Vui lòng thử lại sau.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
              {packages?.map((pkg, index) => {
                const getIconByIndex = (idx: number) => {
                  const icons = [Star, Users, Crown];
                  return icons[idx % icons.length];
                };
                const getColorByIndex = (idx: number) => {
                  const colors = [
                    { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-800' },
                    { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-800', badge: 'bg-purple-100 text-purple-800' },
                    { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800' }
                  ];
                  return colors[idx % colors.length];
                };
                
                const Icon = getIconByIndex(index);
                const colors = getColorByIndex(index);
                const inCart = getPackageInCart(pkg.id);
                const currentQty = quantities[pkg.id] || 1;
                
                return (
                  <Card key={pkg.id} className={`${colors.border} border-2 shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col h-full`}>
                    <CardHeader className={`${colors.bg} rounded-t-lg pb-4`}>
                      <CardTitle className={`flex items-start gap-3 ${colors.text}`}>
                        <Icon className="w-6 h-6 mt-1 flex-shrink-0" />
                        <span className="leading-tight text-lg">{pkg.name}</span>
                      </CardTitle>
                      <Badge variant="secondary" className={`w-fit ${colors.badge} font-bold text-lg mt-3 px-3 py-1`}>
                        {formatCurrency(pkg.price)}
                      </Badge>
                      {pkg.maxRegistrations && pkg._count && (
                        <div className="text-sm text-gray-600 mt-2 font-medium">
                          Còn lại: {pkg.maxRegistrations - pkg._count.registrations}/{pkg.maxRegistrations} chỗ
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-5 md:p-6 flex flex-col flex-1">
                      {/* Content area - grows to fill space */}
                      <div className="flex-1 space-y-4 mb-5">
                        {pkg.description && (
                          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                            {pkg.description}
                          </p>
                        )}
                        {pkg.benefits && pkg.benefits.length > 0 && (
                          <>
                            <h4 className="font-semibold text-gray-800 mb-3 mt-4">Bạn nhận được gì?</h4>
                            <ul className="space-y-3 text-sm md:text-base min-h-[220px]">
                              {pkg.benefits.map((benefit, benefitIndex) => (
                                <li key={benefitIndex} className="flex items-start gap-3">
                                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span className="leading-relaxed flex-1">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>

                      {/* Quantity Selector - always at bottom */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
                        <span className="text-sm font-semibold text-gray-700">Số lượng:</span>
                        <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(pkg.id, false)}
                            disabled={currentQty === 1}
                            className="h-8 w-8 p-0 hover:bg-gray-200"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-lg font-bold w-10 text-center">{currentQty}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(pkg.id, true)}
                            disabled={currentQty >= 10}
                            className="h-8 w-8 p-0 hover:bg-gray-200"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <div className="mt-4">
                        {inCart ? (
                          <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-semibold">Trong giỏ ({inCart.quantity})</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSingerPackage(pkg.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
                            >
                              Xóa
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleAddToCart(pkg)}
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-6 text-base shadow-md hover:shadow-lg transition-all"
                          >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Thêm vào giỏ hàng
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Unique Features */}
          <Card className="mb-12 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-center text-green-800">
                ĐIỂM KHÁC BIỆT CHỈ CÓ TẠI "MÃI CHO HÀNH TINH XANH"
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Video className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <span>Sân khấu thật – ban nhạc live – khán giả thật</span>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <span>TVC cá nhân mang dấu ấn nhân văn – xanh – tử tế</span>
                </div>
                <div className="flex items-start gap-3">
                  <Music className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <span>Gắn âm nhạc với thông điệp sống xanh – phát triển bền vững</span>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <span>Kết nối doanh nhân, chủ cửa hàng, điểm bán trong cộng đồng</span>
                </div>
                <div className="flex items-start gap-3 md:col-span-2 justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <span className="font-medium">Không phô trương – không áp lực – không hình thức</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center mb-12 md:mb-16 px-4">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              MỘT LẦN ĐỨNG TRÊN SÂN KHẤU – MỘT DẤU ẤN ĐỂ NHỚ
            </h3>
            <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8 max-w-3xl mx-auto">
              "Mãi cho Hành Tinh Xanh" không chỉ cho bạn cơ hội hát mà cho bạn trải nghiệm
              được lắng nghe – được ghi nhận – được sống trọn với đam mê.
            </p>
            <p className="text-sm text-gray-600 mb-6 md:mb-8">
              Số lượng học viên & suất biểu diễn có giới hạn cho mỗi đêm nhạc.
            </p>
          </div>
        </div>
      </section>

      {/* Floating Checkout Button */}
      {getTotalCartItems() > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleCheckout}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-6 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all flex items-center gap-3"
          >
            <ShoppingCart className="w-6 h-6" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Giỏ hàng ({getTotalCartItems()})</span>
              <span className="text-lg font-bold">{formatCurrency(getTotalCartAmount())}</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
