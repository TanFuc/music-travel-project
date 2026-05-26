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
    singerPackages,
    removeTour,
    removeSingerPackage,
    updateTourQuantity,
    updateTicketQuantity,
    updateSingerPackageQuantity,
    discount,
    voucherCode,
  } = useCartStore();
  const groupedTickets = tickets.reduce(
    (acc, ticket) => {
      const key = `${ticket.showId}-${ticket.ticketClassId}`;
      if (!acc[key]) {
        acc[key] = { ...ticket, quantity: 0, ids: [] as number[] };
      }
      acc[key].quantity += 1;
      acc[key].ids.push(ticket.ticketId);
      return acc;
    },
    {} as Record<
      string,
      (typeof tickets)[0] & {
        quantity: number;
        ids: number[];
      }
    >
  );
  const { isAuthenticated } = useAuthStore();
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(
    new Set(tickets.map((t) => t.ticketId))
  );
  const [selectedTours, setSelectedTours] = useState<Set<number>>(
    new Set(tours.map((t) => t.scheduleId))
  );
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(
    new Set(singerPackages.map((p) => p.packageId))
  );
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const isEmpty = tickets.length === 0 && tours.length === 0 && singerPackages.length === 0;
  const getSelectedSubtotal = () => {
    const ticketTotal = tickets
      .filter((t) => selectedTickets.has(t.ticketId))
      .reduce((sum, t) => sum + Number(t.price), 0);
    const tourTotal = tours
      .filter((t) => selectedTours.has(t.scheduleId))
      .reduce((sum, t) => sum + Number(t.price) * Number(t.quantity), 0);
    const packageTotal = singerPackages
      .filter((p) => selectedPackages.has(p.packageId))
      .reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0);
    return ticketTotal + tourTotal + packageTotal;
  };
  const selectedSubtotal = getSelectedSubtotal();
  const selectedTotal = selectedSubtotal - discount;
  const selectedCount = selectedTickets.size + selectedTours.size + selectedPackages.size;
  const toggleTour = (id: number) => {
    const newSet = new Set(selectedTours);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTours(newSet);
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
      const selectedTicketsList = tickets.filter((t) => selectedTickets.has(t.ticketId));
      const selectedToursList = tours.filter((t) => selectedTours.has(t.scheduleId));
      const selectedPackagesList = singerPackages.filter((p) => selectedPackages.has(p.packageId));
      const body: {
        ticketsWithSeats?: Array<{
          ticketId: number;
          physicalSeatId?: number;
        }>;
        tourItems?: Array<{
          scheduleId: number;
          quantity: number;
          ticketTypeName?: string;
        }>;
        singerPackages?: Array<{
          packageId: string;
          quantity: number;
        }>;
        voucherCode?: string;
        note?: string;
      } = {};
      if (selectedTicketsList.length) {
        body.ticketsWithSeats = selectedTicketsList.map((t) => ({
          ticketId: Number(t.ticketId),
        }));
      }
      if (selectedToursList.length) {
        body.tourItems = selectedToursList.map((t) => ({
          scheduleId: Number(t.scheduleId),
          quantity: Number(t.quantity),
          ticketTypeName: t.ticketTypeName,
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
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-neutral-300" />
          <h1 className="mb-2 font-display text-2xl font-bold">Giỏ hàng trống</h1>
          <p className="mb-6 text-neutral-600">
            Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sự kiện và tour du lịch hấp
            dẫn!
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
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
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold sm:mb-8 sm:text-3xl">Giỏ Hàng</h1>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {singerPackages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gói Ca Sĩ ({singerPackages.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {singerPackages.map((pkg) => (
                  <div
                    key={pkg.packageId}
                    className="rounded-lg border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedPackages.has(pkg.packageId)}
                        onCheckedChange={() => togglePackage(pkg.packageId)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="text-base font-bold text-green-800">{pkg.packageName}</h4>
                          {pkg.description && (
                            <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                              {pkg.description}
                            </p>
                          )}
                        </div>

                        {pkg.benefits && pkg.benefits.length > 0 && (
                          <div className="rounded-lg border border-green-100 bg-white/50 p-3">
                            <p className="mb-2 text-sm font-semibold text-green-800">Quyền lợi:</p>
                            <ul className="space-y-1.5">
                              {pkg.benefits.map((benefit, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm text-neutral-700"
                                >
                                  <span className="mt-0.5 font-bold text-green-600">✓</span>
                                  <span className="flex-1">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-green-200 pt-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-neutral-600">Số lượng:</span>
                            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-white px-2 py-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-green-100"
                                onClick={() =>
                                  updateSingerPackageQuantity(pkg.packageId, pkg.quantity - 1)
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-bold">
                                {pkg.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-green-100"
                                onClick={() =>
                                  updateSingerPackageQuantity(pkg.packageId, pkg.quantity + 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-neutral-600">
                              Đơn giá: {formatCurrency(pkg.price)}
                            </p>
                            <p className="text-lg font-bold text-green-700">
                              {formatCurrency(pkg.price * pkg.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-error-50 h-8 w-8 flex-shrink-0 text-error-500 hover:text-error-600"
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

          {tickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vé Sự Kiện ({tickets.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.values(groupedTickets).map((group) => (
                  <div
                    key={`${group.showId}-${group.ticketClassId}`}
                    className="flex items-start gap-3 rounded-lg bg-neutral-50 p-3 sm:p-4"
                  >
                    <Checkbox
                      checked={group.ids.every((id) => selectedTickets.has(id))}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(selectedTickets);
                        group.ids.forEach((id) => {
                          if (checked) newSet.add(id);
                          else newSet.delete(id);
                        });
                        setSelectedTickets(newSet);
                      }}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold sm:text-base">{group.showTitle}</h4>
                      <p className="text-xs text-neutral-600 sm:text-sm">
                        {group.ticketClassName}
                        {group.seatInfo && ` - ${group.seatInfo}`}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-xs text-neutral-500">Số lượng:</span>
                        <div className="flex items-center gap-1 rounded-lg border border-neutral-100 bg-white p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateTicketQuantity(
                                group.showId,
                                group.ticketClassId,
                                group.quantity - 1
                              )
                            }
                            disabled={group.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-bold">
                            {group.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateTicketQuantity(
                                group.showId,
                                group.ticketClassId,
                                group.quantity + 1
                              )
                            }
                            disabled={group.quantity >= 10}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-brand-600 sm:text-base">
                          {formatCurrency(group.price * group.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-error-50 h-8 w-8 text-error-500 hover:text-error-600"
                          onClick={() => updateTicketQuantity(group.showId, group.ticketClassId, 0)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {tours.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tour Du Lịch ({tours.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tours.map((tour) => (
                  <div
                    key={tour.scheduleId}
                    className="flex items-start gap-3 rounded-lg bg-neutral-50 p-3 sm:p-4"
                  >
                    <Checkbox
                      checked={selectedTours.has(tour.scheduleId)}
                      onCheckedChange={() => toggleTour(tour.scheduleId)}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold sm:text-base">{tour.tourTitle}</h4>
                      <p className="text-xs text-neutral-600 sm:text-sm">
                        Khởi hành: {new Date(tour.startDate).toLocaleDateString('vi-VN')}
                        {tour.ticketTypeName ? ` • ${tour.ticketTypeName}` : ''}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-xs text-neutral-500">Số lượng:</span>
                        <div className="flex items-center gap-1 rounded-lg border border-neutral-100 bg-white p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateTourQuantity(tour.scheduleId, tour.quantity - 1)}
                            disabled={tour.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-bold">{tour.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateTourQuantity(tour.scheduleId, tour.quantity + 1)}
                            disabled={tour.quantity >= 10}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-brand-600 sm:text-base">
                          {formatCurrency(tour.price * tour.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-error-50 h-8 w-8 text-error-500 hover:text-error-600"
                          onClick={() => removeTour(tour.scheduleId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

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
                  <div className="flex justify-between text-lg font-bold">
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
                  <p className="text-center text-xs text-neutral-500">
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
