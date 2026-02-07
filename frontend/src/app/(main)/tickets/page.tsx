'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TicketTier } from '@/types/api.types';
import { ticketService } from '@/services/ticket.service';
import { bookingService } from '@/services/booking.service';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Minus, Plus, ShoppingCart, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart.store';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function TicketsPage() {
    usePageTitle();
    const router = useRouter();
    const addTicketTier = useCartStore((state) => state.addTicketTier);
    const [tiers, setTiers] = useState<TicketTier[]>([]);
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

        // Add tickets to cart store
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

        toast.success(`Đã thêm ${totalItems} vé vào giỏ hàng!`, {
            duration: 800,
        });
        // Reset quantities after adding to cart
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

            // Create booking immediately
            const newBooking = await bookingService.createBooking({
                ticketTiers,
            });

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
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Mua Vé Tham Dự</h1>
                <p className="mt-2 text-lg text-gray-600">
                    Vé được sử dụng 01 lần và cho tất cả các chương trình
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {tiers.map((tier) => (
                    <Card key={tier.id} className="flex flex-col border-2 transition-all hover:border-primary/50 relative overflow-hidden">
                        {/* Color Banner */}
                        <div
                            className="h-2 w-full absolute top-0 left-0"
                            style={{ backgroundColor: tier.colorCode || '#4CAF50' }}
                        />

                        <CardHeader>
                            <CardTitle className="flex flex-col gap-2">
                                <span className="text-xl font-bold line-clamp-2 min-h-[3.5rem]">{tier.name}</span>
                                <span className="text-2xl font-bold text-primary">
                                    {formatCurrency(tier.price)}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="text-sm text-gray-600">
                                <p className="font-medium mb-2">Mô tả:</p>
                                <p className="mb-4">{tier.description}</p>

                                {tier.benefits && (
                                    <>
                                        <p className="font-medium mb-2">Quyền lợi:</p>
                                        <div className="whitespace-pre-line rounded-lg bg-gray-50 p-3">
                                            {tier.benefits}
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 border-t">
                            <div className="flex w-full items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">Số lượng:</span>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => updateQuantity(tier.id, -1)}
                                        disabled={!quantities[tier.id]}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center font-bold text-lg">
                                        {quantities[tier.id] || 0}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => updateQuantity(tier.id, 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Sticky Bottom Summary */}
            <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 shadow-lg sm:px-6 lg:px-8 z-50">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center justify-between sm:flex-col sm:items-start">
                        <span className="text-sm text-gray-500">Tổng cộng ({totalItems} vé):</span>
                        <span className="text-xl sm:text-2xl font-bold text-primary">
                            {formatCurrency(totalPrice)}
                        </span>
                    </div>
                    <div className="flex w-full gap-3 sm:w-auto">
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleAddToCart}
                            disabled={totalItems === 0}
                            className="flex-1 sm:min-w-[140px] sm:flex-none"
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Thêm vào giỏ
                        </Button>
                        <Button
                            size="lg"
                            onClick={handleBuyNow}
                            disabled={totalItems === 0 || bookingLoading}
                            className="flex-1 sm:min-w-[140px] sm:flex-none"
                        >
                            {bookingLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Ticket className="mr-2 h-4 w-4" />
                            )}
                            Mua ngay
                        </Button>
                    </div>
                </div>
            </div>
            {/* Spacer for sticky footer */}
            <div className="h-32 sm:h-24"></div>
        </div>
    );
}
