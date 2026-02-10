'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TicketTier } from '@/types/api.types';
import { ticketService } from '@/services/ticket.service';
import { bookingService } from '@/services/booking.service';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Minus, Plus, ShoppingCart, Ticket, Check, Sparkles, Tag, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart.store';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/lib/utils';

// Extended type for this component since API might not return it yet in types
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
        // ... (Logic giữ nguyên)
        if (totalItems === 0) {
            toast.error('Vui lòng chọn ít nhất 1 vé');
            return;
        }

        Object.entries(quantities).forEach(([tierId, qty]) => {
            if (qty > 0) {
                const tier = tiers.find(t => t.id === Number(tierId));
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
            {/* Immersive Header */}
            <div className="relative bg-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-70"></div>
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>

                <div className="container mx-auto px-4 pt-16 pb-12 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-100 shadow-sm rounded-full text-brand-600 text-sm font-semibold mb-6 animate-in fade-in zoom-in duration-500">
                        <Sparkles className="w-4 h-4 fill-brand-100" />
                        <span>Vé Chính Hãng & Dịch Vụ 5 Sao</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                        Trải Nghiệm <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Tuyệt Vời Nhất</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Chọn hạng vé phù hợp để tận hưởng trọn vẹn không gian âm nhạc đẳng cấp.
                        Ưu đãi đặc biệt khi đặt vé sớm.
                    </p>
                </div>
            </div>

            {/* Ticket Cards Container */}
            <div className="container mx-auto px-4 py-8 -mt-6 relative z-20">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tiers.map((tier) => {
                        const hasDiscount = tier.originalPrice && tier.originalPrice > tier.price;
                        const discountPercent = hasDiscount
                            ? Math.round(((tier.originalPrice! - tier.price) / tier.originalPrice!) * 100)
                            : 0;

                        const benefitsList = tier.benefits
                            ? tier.benefits.split('\n').filter(line => line.trim().length > 0)
                            : [];

                        // Dynamic shadow based on color code
                        const shadowColor = tier.colorCode ? `${tier.colorCode}20` : '#00000010';

                        return (
                            <div
                                key={tier.id}
                                className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                                style={{
                                    boxShadow: `0 4px 6px -1px ${shadowColor}, 0 2px 4px -1px ${shadowColor}`
                                }}
                            >
                                {/* Decorative Gradient Top */}
                                <div
                                    className="absolute top-0 inset-x-0 h-1.5 w-full"
                                    style={{ backgroundColor: tier.colorCode || '#3b82f6' }}
                                />

                                {/* Card Body */}
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
                                    <div className="mb-6 pr-12">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors duration-200">
                                            {tier.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">
                                            {tier.description || "Vé tham dự sự kiện tiêu chuẩn."}
                                        </p>
                                    </div>

                                    {/* Price Card */}
                                    <div className="bg-gray-50/50 rounded-xl p-5 mb-6 border border-gray-100 group-hover:bg-brand-50/30 group-hover:border-brand-100 transition-colors duration-300">
                                        <div className="flex flex-col items-center text-center">
                                            {hasDiscount && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Giá gốc</span>
                                                    <span className="text-sm text-gray-400 font-medium line-through decoration-gray-400">
                                                        {formatCurrency(tier.originalPrice!)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-extrabold text-gray-900 group-hover:text-brand-700 transition-colors">
                                                    {new Intl.NumberFormat('vi-VN').format(tier.price)}
                                                </span>
                                                <span className="text-base font-bold text-gray-500 group-hover:text-brand-600">₫</span>
                                            </div>
                                            <div className="mt-1 text-xs text-gray-400 font-medium">Bao gồm thuế & phí</div>
                                        </div>
                                    </div>

                                    {/* Benefits */}
                                    {benefitsList.length > 0 && (
                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Info className="w-4 h-4" /> Quyền lợi
                                            </h4>
                                            <ul className="space-y-3">
                                                {benefitsList.map((benefit, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                                            <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                                                        </div>
                                                        <span className="leading-snug pt-0.5">{benefit.replace(/^[•-]\s*/, '')}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Quantity Selector */}
                                        <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-[120px] justify-between">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 rounded-md hover:bg-gray-100 text-gray-500"
                                                onClick={() => updateQuantity(tier.id, -1)}
                                                disabled={!quantities[tier.id]}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="text-base font-bold text-gray-900 min-w-[20px] text-center">
                                                {quantities[tier.id] || 0}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 rounded-md hover:bg-brand-50 text-brand-600 hover:text-brand-700"
                                                onClick={() => updateQuantity(tier.id, 1)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Subtotal Display */}
                                        <div className="flex-1 text-right">
                                            {(quantities[tier.id] || 0) > 0 ? (
                                                <div className="animate-in slide-in-from-right-2 duration-200">
                                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Tổng</div>
                                                    <div className="text-lg font-bold text-brand-600 leading-none">
                                                        {formatCurrency((quantities[tier.id] || 0) * tier.price)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Chưa chọn vé</span>
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
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white to-transparent -z-10 h-32 pointer-events-none"></div>

                <div className="container mx-auto px-4 pb-6 pt-2 max-w-5xl">
                    <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-800 backdrop-blur-xl bg-opacity-95">
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Đã chọn {totalItems} vé</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-200 to-white">
                                        {formatCurrency(totalPrice)}
                                    </span>
                                </div>
                            </div>

                            {/* Divider for desktop */}
                            <div className="hidden md:block w-px h-10 bg-gray-700"></div>

                            {/* Details for desktop */}
                            <div className="hidden md:flex flex-col">
                                <span className="text-gray-400 text-xs font-medium">Bạn đã tiết kiệm được</span>
                                <span className="text-green-400 text-sm font-bold">
                                    {/* Placeholder for total savings logic if needed */}
                                    Ưu đãi tốt nhất
                                </span>
                            </div>
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
                                disabled={bookingLoading}
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

            {/* Spacer */}
            <div className="h-32"></div>
        </div>
    );
}
