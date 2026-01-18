'use client';

import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { tickets, tours, removeTicket, removeTour, getSubtotal, getTotal, discount, voucherCode } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();

  const isEmpty = tickets.length === 0 && tours.length === 0;

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">Giỏ hàng trống</h1>
          <p className="text-neutral-600 mb-6">
            Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sự kiện và tour du lịch hấp
            dẫn!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shows">
              <Button>Xem Sự Kiện</Button>
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
          {/* Tickets */}
          {tickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vé Sự Kiện ({tickets.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.ticketId}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base">{ticket.showTitle}</h4>
                      <p className="text-xs sm:text-sm text-neutral-600">
                        {ticket.ticketClassName}
                        {ticket.seatInfo && ` - ${ticket.seatInfo}`}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
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
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base">{tour.tourTitle}</h4>
                      <p className="text-xs sm:text-sm text-neutral-600">
                        Khởi hành: {new Date(tour.startDate).toLocaleDateString('vi-VN')} •{' '}
                        {tour.quantity} người
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
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
                  <span className="text-neutral-600">Tạm tính</span>
                  <span>{formatCurrency(getSubtotal())}</span>
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
                    <span className="text-brand-600">{formatCurrency(getTotal())}</span>
                  </div>
                </div>
              </div>

              {isAuthenticated ? (
                <Link href="/checkout">
                  <Button className="w-full" size="lg">
                    Thanh Toán
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
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
