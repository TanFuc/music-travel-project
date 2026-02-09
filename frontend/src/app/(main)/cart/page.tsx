'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/components/common/Link';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency } from '@/lib/utils';
import { bookingService } from '@/services/booking.service';
import { toast } from 'sonner';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function CartPage() {
  usePageTitle();
  const router = useRouter();
  const {
    tickets,
    tours,
    ticketTiers,
    singerPackages,
    removeTicket,
    removeTour,
    removeTicketTier,
    removeSingerPackage,
    updateTicketTierQuantity,
    updateSingerPackageQuantity,
    discount,
    voucherCode,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Track which items are selected for checkout
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(new Set(tickets.map(t => t.ticketId)));
  const [selectedTours, setSelectedTours] = useState<Set<number>>(new Set(tours.map(t => t.scheduleId)));
  const [selectedTiers, setSelectedTiers] = useState<Set<number>>(new Set(ticketTiers.map(t => t.tierId)));
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set(singerPackages.map(p => p.packageId)));
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const isEmpty = tickets.length === 0 && tours.length === 0 && ticketTiers.length === 0 && singerPackages.length === 0;

  // Calculate subtotal based on selected items only
  const getSelectedSubtotal = () => {
    const ticketTotal = tickets
      .filter(t => selectedTickets.has(t.ticketId))
      .reduce((sum, t) => sum + Number(t.price), 0);
    const tourTotal = tours
      .filter(t => selectedTours.has(t.scheduleId))
      .reduce((sum, t) => sum + Number(t.price) * Number(t.quantity), 0);
    const tierTotal = ticketTiers
      .filter(t => selectedTiers.has(t.tierId))
      .reduce((sum, t) => sum + Number(t.price) * Number(t.quantity), 0);
    const packageTotal = singerPackages
      .filter(p => selectedPackages.has(p.packageId))
      .reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0);
    return ticketTotal + tourTotal + tierTotal + packageTotal;
  };

  const selectedSubtotal = getSelectedSubtotal();
  const selectedTotal = selectedSubtotal - discount;
  const selectedCount = selectedTickets.size + selectedTours.size + selectedTiers.size + selectedPackages.size;

  const toggleTicket = (id: number) => {
    const newSet = new Set(selectedTickets);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTickets(newSet);
  };

  const toggleTour = (id: number) => {
    const newSet = new Set(selectedTours);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTours(newSet);
  };

  const toggleTier = (id: number) => {
    const newSet = new Set(selectedTiers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTiers(newSet);
  };

  const togglePackage = (id: string) => {
    const newSet = new Set(selectedPackages);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedPackages(newSet);
  };

  const handleCheckout = async () => {
    if (selectedCount === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán');
      return;
    }

    setIsCheckingOut(true);
    try {
      // Body must match backend CreateBookingDto exactly: ticketIds | ticketsWithSeats | ticketTiers | tourItems + optional voucherCode, note, metadata
      const selectedTicketsList = tickets.filter(t => selectedTickets.has(t.ticketId));
      const selectedToursList = tours.filter(t => selectedTours.has(t.scheduleId));
      const selectedTiersList = ticketTiers.filter(t => selectedTiers.has(t.tierId));
      const selectedPackagesList = singerPackages.filter(p => selectedPackages.has(p.packageId));

      const body: {
        ticketsWithSeats?: Array<{ ticketId: number; physicalSeatId?: number }>;
        ticketTiers?: Array<{ tierId: number; quantity: number }>;
        tourItems?: Array<{ scheduleId: number; quantity: number }>;
        singerPackages?: Array<{ packageId: string; quantity: number }>;
        voucherCode?: string;
        note?: string;
      } = {};

      if (selectedTicketsList.length) {
        body.ticketsWithSeats = selectedTicketsList.map((t) => ({
          ticketId: Number(t.ticketId),
        }));
      }
      if (selectedTiersList.length) {
        body.ticketTiers = selectedTiersList.map((t) => ({
          tierId: Number(t.tierId),
          quantity: Number(t.quantity),
        }));
      }
      if (selectedToursList.length) {
        body.tourItems = selectedToursList.map((t) => ({
          scheduleId: Number(t.scheduleId),
          quantity: Number(t.quantity),
        }));
      }
      if (selectedPackagesList.length) {
        body.singerPackages = selectedPackagesList.map((p) => ({
          packageId: p.packageId,
          quantity: Number(p.quantity),
        }));
      }
      const vCode = voucherCode?.trim();
      if (vCode) body.voucherCode = vCode;

      const booking = await bookingService.createBooking(body);

      if (booking) {
        // Do not remove items here - wait for successful payment
        // selectedTickets.forEach(id => removeTicket(id));
        // selectedTours.forEach(id => removeTour(id));
        // selectedTiers.forEach(id => removeTicketTier(id));

        toast.success('Đã tạo đơn hàng thành công!');
        router.push(`/checkout?code=${booking.bookingCode}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">Giỏ hàng trống</h1>
          <p className="text-neutral-600 mb-6">
            Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sự kiện và tour du lịch hấp dẫn!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tickets">
              <Button>Mua Vé</Button>
            </Link>
            <Link href="/shows">
              <Button variant="outline">Xem Sự Kiện</Button>
            </Link>
            <Link href="/tours">
              <Button variant="outline">Xem Tour</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-display font-bold mb-6 sm:mb-8">Giỏ Hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Singer Packages */}
          {singerPackages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gói Ca Sĩ ({singerPackages.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {singerPackages.map((pkg) => (
                  <div
                    key={pkg.packageId}
                    className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedPackages.has(pkg.packageId)}
                        onCheckedChange={() => togglePackage(pkg.packageId)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-bold text-base text-green-800">{pkg.packageName}</h4>
                          {pkg.description && (
                            <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{pkg.description}</p>
                          )}
                        </div>

                        {/* Benefits */}
                        {pkg.benefits && pkg.benefits.length > 0 && (
                          <div className="bg-white/50 rounded-lg p-3 border border-green-100">
                            <p className="text-sm font-semibold text-green-800 mb-2">Quyền lợi:</p>
                            <ul className="space-y-1.5">
                              {pkg.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-neutral-700">
                                  <span className="text-green-600 mt-0.5 font-bold">✓</span>
                                  <span className="flex-1">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between pt-2 border-t border-green-200">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-neutral-600">Số lượng:</span>
                            <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 border border-green-200">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-green-100"
                                onClick={() => updateSingerPackageQuantity(pkg.packageId, pkg.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-bold w-8 text-center">{pkg.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-green-100"
                                onClick={() => updateSingerPackageQuantity(pkg.packageId, pkg.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-neutral-600">Đơn giá: {formatCurrency(pkg.price)}</p>
                            <p className="font-bold text-green-700 text-lg">{formatCurrency(pkg.price * pkg.quantity)}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-error-500 hover:text-error-600 hover:bg-error-50 h-8 w-8 flex-shrink-0"
                        onClick={() => removeSingerPackage(pkg.packageId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Ticket Tiers */}
          {ticketTiers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vé Tham Dự ({ticketTiers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticketTiers.map((tier) => (
                  <div
                    key={tier.tierId}
                    className="flex items-start gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg"
                  >
                    <Checkbox
                      checked={selectedTiers.has(tier.tierId)}
                      onCheckedChange={() => toggleTier(tier.tierId)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base">{tier.tierName}</h4>
                      <p className="text-xs sm:text-sm text-neutral-600">
                        {formatCurrency(tier.price)} × {tier.quantity}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateTicketTierQuantity(tier.tierId, tier.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{tier.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateTicketTierQuantity(tier.tierId, tier.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold text-brand-600 text-sm sm:text-base">
                        {formatCurrency(tier.price * tier.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-error-500 hover:text-error-600 hover:bg-error-50 h-8 w-8"
                        onClick={() => removeTicketTier(tier.tierId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Show Tickets */}
          {tickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vé Sự Kiện ({tickets.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.ticketId}
                    className="flex items-start gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg"
                  >
                    <Checkbox
                      checked={selectedTickets.has(ticket.ticketId)}
                      onCheckedChange={() => toggleTicket(ticket.ticketId)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base">{ticket.showTitle}</h4>
                      <p className="text-xs sm:text-sm text-neutral-600">
                        {ticket.ticketClassName}
                        {ticket.seatInfo && ` - ${ticket.seatInfo}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-brand-600 text-sm sm:text-base">
                        {formatCurrency(ticket.price)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-error-500 hover:text-error-600 hover:bg-error-50"
                        onClick={() => removeTicket(ticket.ticketId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tours */}
          {tours.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tour Du Lịch ({tours.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tours.map((tour) => (
                  <div
                    key={tour.scheduleId}
                    className="flex items-start gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg"
                  >
                    <Checkbox
                      checked={selectedTours.has(tour.scheduleId)}
                      onCheckedChange={() => toggleTour(tour.scheduleId)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base">{tour.tourTitle}</h4>
                      <p className="text-xs sm:text-sm text-neutral-600">
                        Khởi hành: {new Date(tour.startDate).toLocaleDateString('vi-VN')} • {tour.quantity} người
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-brand-600 text-sm sm:text-base">
                        {formatCurrency(tour.price * tour.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-error-500 hover:text-error-600 hover:bg-error-50"
                        onClick={() => removeTour(tour.scheduleId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle>Tổng Đơn Hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Đã chọn ({selectedCount} sản phẩm)</span>
                  <span>{formatCurrency(selectedSubtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-success-600">
                    <span>Giảm giá ({voucherCode})</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-brand-600">{formatCurrency(selectedTotal)}</span>
                  </div>
                </div>
              </div>

              {isAuthenticated ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={selectedCount === 0 || isCheckingOut}
                >
                  {isCheckingOut ? 'Đang xử lý...' : 'Thanh Toán'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="space-y-2">
                  <Link href="/login">
                    <Button className="w-full" size="lg">
                      Đăng nhập để thanh toán
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-neutral-500">
                    Bạn cần đăng nhập để tiếp tục thanh toán
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
