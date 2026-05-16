'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/components/common/Link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Building2,
  ShieldCheck,
  Tag,
  Banknote,
  QrCode,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { get, post } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import dynamic from 'next/dynamic';
import {
  PaymentMethodConfig,
  paymentMethodConfigService,
} from '@/services/payment-method-config.service';
const PaymentQRModal = dynamic(() => import('@/components/payment/PaymentQRModal'), { ssr: false });
const PAYMENT_METHOD_INFO: Record<
  string,
  {
    description: string;
    icon: any;
  }
> = {
  BANK_QR: { description: 'Thanh toán bằng mã QR', icon: QrCode },
  MOMO: { description: 'Ví điện tử MoMo', icon: CreditCard },
  VNPAY: { description: 'Cổng thanh toán VNPAY', icon: CreditCard },
  BANKING: { description: 'Chuyển khoản ngân hàng', icon: Building2 },
  CASH: { description: 'Thanh toán tại quầy', icon: Banknote },
  WALLET: { description: 'Thanh toán bằng số dư ví', icon: Wallet },
  PAYOS: { description: 'Cổng thanh toán PayOS', icon: CreditCard },
};
import { useQueryClient } from '@tanstack/react-query';
const checkoutSchema = z.object({
  paymentMethod: z.enum(['WALLET', 'MOMO', 'VNPAY', 'BANKING', 'CASH', 'BANK_QR']),
  voucherCode: z.string().optional(),
  note: z.string().optional(),
});
type CheckoutForm = z.infer<typeof checkoutSchema>;
interface VoucherValidation {
  valid: boolean;
  discountAmount: number;
  message: string;
}
interface BookingItem {
  id: number;
  itemType: 'SHOW_TICKET' | 'TOUR_SLOT' | 'SINGER_PACKAGE';
  quantity: number;
  originalPrice: number;
  ticket?: {
    id: number;
    ticketCode: string;
    show?: {
      id: number;
      title: string;
      performTime: string;
    };
    ticketClass?: {
      id: number;
      name: string;
      price: number;
    };
    physicalSeat?: {
      id: number;
      zoneName: string;
      rowName: string;
      seatNumber: string;
    };
  };
  tourSchedule?: {
    id: number;
    startDate: string;
    price: number;
    tour?: {
      id: number;
      title: string;
    };
  };
  ticketTier?: {
    id: number;
    name: string;
    price: number;
    description?: string;
  };
  singerPackage?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    benefits?: string[];
  };
}
interface Booking {
  id: number;
  bookingCode: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: string;
  paymentStatus: string;
  items: BookingItem[];
}
export default function CheckoutPage() {
  usePageTitle();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const bookingCode = searchParams.get('code');
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const {
    tickets,
    tours,
    singerPackages,
    getSubtotal,
    getTotal,
    discount,
    voucherCode,
    setVoucher,
    clearVoucher,
    clearCart,
    removeTicket,
    removeTour,
    removeSingerPackage,
  } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherInput, setVoucherInput] = useState(voucherCode || '');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [createdBookingCode, setCreatedBookingCode] = useState<string | null>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentMethodConfig[]>([]);
  useEffect(() => {
    paymentMethodConfigService
      .getAllActive()
      .then((configs) => {
        setPaymentConfigs(configs);
      })
      .catch(console.error);
  }, []);
  const isBuyNowMode = !!bookingCode;
  const isEmpty = !isBuyNowMode && tickets.length === 0 && tours.length === 0;
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);
  useEffect(() => {
    if (isEmpty && !isBuyNowMode) {
      router.push('/cart');
    }
  }, [isEmpty, isBuyNowMode, router]);
  useEffect(() => {
    if (bookingCode && isAuthenticated) {
      setIsLoadingBooking(true);
      get<Booking>(`/bookings/${bookingCode}`)
        .then((data) => {
          setBooking(data);
        })
        .catch(() => {
          toast.error('Không thể tải thông tin đơn hàng');
          router.push('/cart');
        })
        .finally(() => {
          setIsLoadingBooking(false);
        });
    }
  }, [bookingCode, isAuthenticated, router]);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'BANK_QR',
      voucherCode: voucherCode || '',
      note: '',
    },
  });
  const selectedMethod = watch('paymentMethod');
  const selectedConfig = paymentConfigs.find((c) => c.method === selectedMethod);
  const currentTotal = isBuyNowMode && booking ? booking.finalAmount : getTotal();
  const paymentDiscountAmount =
    selectedConfig && selectedConfig.discountPercentage > 0
      ? Math.round(currentTotal * (Number(selectedConfig.discountPercentage) / 100))
      : 0;
  const finalTotalAmount = currentTotal - paymentDiscountAmount;
  const handleValidateVoucher = async () => {
    if (!voucherInput.trim()) {
      clearVoucher();
      return;
    }
    setIsValidatingVoucher(true);
    try {
      const result = await post<VoucherValidation>('/vouchers/validate', {
        code: voucherInput,
        orderAmount: getSubtotal(),
      });
      if (result.valid) {
        setVoucher(voucherInput, result.discountAmount);
        setValue('voucherCode', voucherInput);
        toast.success(`Da ap dung voucher: Giam ${formatCurrency(result.discountAmount)}`);
      } else {
        clearVoucher();
        toast.error(result.message || 'Voucher khong hop le');
      }
    } catch {
      clearVoucher();
      toast.error('Khong the kiem tra voucher. Vui long thu lai.');
    } finally {
      setIsValidatingVoucher(false);
    }
  };
  const onSubmit = async (data: CheckoutForm) => {
    if (['BANK_QR', 'MOMO'].includes(data.paymentMethod)) {
      setIsProcessing(true);
      try {
        let currentBookingCode = bookingCode;
        if (booking) {
          currentBookingCode = booking.bookingCode;
        }
        if (!isBuyNowMode) {
          const bookingPayload: {
            ticketsWithSeats?: Array<{
              ticketId: number;
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
          if (tickets.length) {
            bookingPayload.ticketsWithSeats = tickets.map((t) => ({ ticketId: t.ticketId }));
          }
          if (tours.length) {
            bookingPayload.tourItems = tours.map((t) => ({
              scheduleId: t.scheduleId,
              quantity: t.quantity,
              ticketTypeName: t.ticketTypeName,
            }));
          }
          if (singerPackages.length) {
            bookingPayload.singerPackages = singerPackages.map((p) => ({
              packageId: p.packageId,
              quantity: p.quantity,
            }));
          }
          if (data.voucherCode?.trim()) {
            bookingPayload.voucherCode = data.voucherCode.trim();
          }
          if (data.note?.trim()) {
            bookingPayload.note = data.note.trim();
          }
          const createResult = await post<{
            bookingCode: string;
          }>('/bookings', bookingPayload);
          currentBookingCode = createResult.bookingCode;
        }
        if (currentBookingCode) {
          setCreatedBookingCode(currentBookingCode);
          setIsQRModalOpen(true);
        }
      } catch (error: unknown) {
        const err = error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };
        toast.error(err.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      } finally {
        setIsProcessing(false);
      }
      return;
    }
    setIsProcessing(true);
    try {
      if (isBuyNowMode && booking) {
        const result = await post<{
          paymentUrl?: string;
        }>('/payments/checkout', {
          bookingCode: booking.bookingCode,
          paymentMethod: data.paymentMethod,
        });
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          booking.items.forEach((item) => {
            if (item.tourSchedule) {
              removeTour(item.tourSchedule.id);
            } else if (item.ticket) {
              removeTicket(item.ticket.id);
            }
          });
          toast.success('Thanh toán thành công!');
          router.push(`/profile?booking=${booking.bookingCode}`);
        }
      } else {
        const bookingPayload: {
          ticketsWithSeats?: Array<{
            ticketId: number;
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
        if (tickets.length) {
          bookingPayload.ticketsWithSeats = tickets.map((t) => ({ ticketId: t.ticketId }));
        }
        if (tours.length) {
          bookingPayload.tourItems = tours.map((t) => ({
            scheduleId: t.scheduleId,
            quantity: t.quantity,
            ticketTypeName: t.ticketTypeName,
          }));
        }
        if (singerPackages.length) {
          bookingPayload.singerPackages = singerPackages.map((p) => ({
            packageId: p.packageId,
            quantity: p.quantity,
          }));
        }
        if (data.voucherCode?.trim()) {
          bookingPayload.voucherCode = data.voucherCode.trim();
        }
        if (data.note?.trim()) {
          bookingPayload.note = data.note.trim();
        }
        const createResult = await post<{
          bookingCode: string;
        }>('/bookings', bookingPayload);
        const checkoutResult = await post<{
          paymentUrl?: string;
        }>('/payments/checkout', {
          bookingCode: createResult.bookingCode,
          paymentMethod: data.paymentMethod,
        });
        clearCart();
        if (checkoutResult.paymentUrl) {
          window.location.href = checkoutResult.paymentUrl;
        } else {
          toast.success('Đặt hàng thành công!');
          router.push(`/profile?booking=${createResult.bookingCode}`);
        }
      }
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };
  if (!isAuthenticated || isEmpty) {
    return null;
  }
  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/cart"
        prefetch={false}
        className="mb-4 inline-flex items-center text-neutral-600 hover:text-brand-500 sm:mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại giỏ hàng
      </Link>

      <h1 className="mb-6 font-display text-2xl font-bold sm:mb-8 sm:text-3xl">Thanh Toán</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentConfigs.map((config) => {
                  const info = PAYMENT_METHOD_INFO[config.method] || {
                    description: 'Phương thức thanh toán',
                    icon: CreditCard,
                  };
                  const Icon = info.icon;
                  return (
                    <label
                      key={config.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors sm:gap-4 sm:p-4 ${
                        selectedMethod === config.method
                          ? 'border-brand-500 bg-brand-50'
                          : 'hover:border-neutral-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={config.method}
                        {...register('paymentMethod')}
                        className="sr-only"
                      />
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full sm:h-10 sm:w-10 ${selectedMethod === config.method ? 'bg-brand-500 text-white' : 'bg-neutral-100'}`}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold sm:text-base">{config.name}</h4>
                          {Number(config.discountPercentage) > 0 && (
                            <Badge variant="destructive" className="h-5 px-1.5 py-0 text-[10px]">
                              Giảm {Number(config.discountPercentage)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 sm:text-sm">{info.description}</p>
                      </div>
                      {selectedMethod === config.method && (
                        <Badge variant="success" className="hidden sm:inline-flex">
                          Đã chọn
                        </Badge>
                      )}
                    </label>
                  );
                })}
                {errors.paymentMethod && (
                  <p className="text-sm text-error-500">{errors.paymentMethod.message}</p>
                )}
              </CardContent>
            </Card>

            {!isBuyNowMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Mã giảm giá
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập mã giảm giá"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleValidateVoucher}
                      disabled={isValidatingVoucher}
                    >
                      {isValidatingVoucher ? 'Đang kiểm tra...' : 'Áp dụng'}
                    </Button>
                  </div>
                  {voucherCode && discount > 0 && (
                    <div className="bg-success-50 mt-3 flex items-center justify-between rounded-lg p-3">
                      <span className="text-sm text-success-600">
                        Mã {voucherCode}: Giảm {formatCurrency(discount)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          clearVoucher();
                          setVoucherInput('');
                          setValue('voucherCode', '');
                        }}
                        className="h-auto py-1 text-neutral-500"
                      >
                        Xóa
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  {...register('note')}
                  placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                  className="h-24 w-full resize-none rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle>Chi tiết đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-80 space-y-3 overflow-y-auto">
                  {isBuyNowMode && booking ? (
                    <>
                      {booking.items.map((item, index) => {
                        const isTicket = item.itemType === 'SHOW_TICKET';
                        const isTour = item.itemType === 'TOUR_SLOT';
                        const isSingerPackage = item.itemType === 'SINGER_PACKAGE';
                        const showTitle = item.ticket?.show?.title;
                        const ticketTierName = item.ticketTier?.name;
                        const ticketClassName = item.ticket?.ticketClass?.name;
                        const tourTitle = item.tourSchedule?.tour?.title;
                        const packageName = item.singerPackage?.name;
                        const packageDescription = item.singerPackage?.description;
                        const packageBenefits = item.singerPackage?.benefits as string[] | null;
                        const seatInfo = item.ticket?.physicalSeat
                          ? `${item.ticket.physicalSeat.zoneName || ''} - Hàng ${item.ticket.physicalSeat.rowName}, Ghế ${item.ticket.physicalSeat.seatNumber}`
                          : null;
                        const unitPrice = item.originalPrice;
                        const totalPrice = unitPrice * item.quantity;
                        return (
                          <div
                            key={item.id}
                            className={`space-y-3 rounded-lg p-4 ${isSingerPackage ? 'border border-green-200 bg-gradient-to-r from-green-50 to-blue-50' : 'bg-neutral-50'}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-neutral-900">
                                  {isTicket
                                    ? showTitle || 'Vé xem show'
                                    : isTour
                                      ? tourTitle || 'Tour du lịch'
                                      : packageName || 'Gói ca sĩ'}
                                </p>

                                <Badge
                                  variant="outline"
                                  className={`mt-1 text-xs ${isSingerPackage ? 'border-green-200 bg-green-50 text-green-700' : ''}`}
                                >
                                  {isTicket ? 'Vé xem show' : isTour ? 'Tour' : 'Gói ca sĩ'}
                                </Badge>
                              </div>
                              <span className="text-xs text-neutral-500">#{index + 1}</span>
                            </div>

                            <div className="space-y-2 text-sm">
                              {isSingerPackage && packageDescription && (
                                <div className="border-b border-green-200 pb-2">
                                  <p className="leading-relaxed text-neutral-700">
                                    {packageDescription}
                                  </p>
                                </div>
                              )}

                              {isSingerPackage && packageBenefits && packageBenefits.length > 0 && (
                                <div className="border-b border-green-200 pb-2">
                                  <p className="mb-2 font-semibold text-green-800">Quyền lợi:</p>
                                  <ul className="ml-1 space-y-1.5">
                                    {packageBenefits.map((benefit, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-start gap-2 text-neutral-700"
                                      >
                                        <span className="mt-0.5 text-green-600">✓</span>
                                        <span className="flex-1 leading-relaxed">{benefit}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {(ticketTierName || ticketClassName) && (
                                <div className="flex justify-between">
                                  <span className="text-neutral-600">Loại vé:</span>
                                  <span className="font-medium">
                                    {ticketTierName || ticketClassName}
                                  </span>
                                </div>
                              )}

                              {seatInfo && (
                                <div className="flex justify-between">
                                  <span className="text-neutral-600">Vị trí:</span>
                                  <span className="font-medium">{seatInfo}</span>
                                </div>
                              )}

                              {isTour && item.tourSchedule?.startDate && (
                                <div className="flex justify-between">
                                  <span className="text-neutral-600">Ngày khởi hành:</span>
                                  <span className="font-medium">
                                    {new Date(item.tourSchedule.startDate).toLocaleDateString(
                                      'vi-VN'
                                    )}
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between border-t border-neutral-200 pt-1">
                                <span className="font-medium text-neutral-600">Số lượng:</span>
                                <span className="font-semibold">{item.quantity}</span>
                              </div>

                              <div className="flex justify-between">
                                <span className="font-medium text-neutral-600">Đơn giá:</span>
                                <span className="font-semibold">{formatCurrency(unitPrice)}</span>
                              </div>
                            </div>

                            <div className="flex justify-between border-t border-neutral-200 pt-2">
                              <span className="text-sm font-medium text-neutral-700">
                                Thành tiền:
                              </span>
                              <span className="font-bold text-brand-600">
                                {formatCurrency(totalPrice)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {tickets.map((ticket, index) => (
                        <div
                          key={ticket.ticketId}
                          className="space-y-2 rounded-lg bg-neutral-50 p-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-neutral-900">
                                {ticket.showTitle}
                              </p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                Vé xem show
                              </Badge>
                            </div>
                            <span className="text-xs text-neutral-500">#{index + 1}</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Loại vé:</span>
                              <span className="font-medium">{ticket.ticketClassName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Số lượng:</span>
                              <span className="font-medium">1</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Đơn giá:</span>
                              <span className="font-medium">{formatCurrency(ticket.price)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between border-t border-neutral-200 pt-2">
                            <span className="text-sm font-medium text-neutral-700">
                              Thành tiền:
                            </span>
                            <span className="font-bold text-brand-600">
                              {formatCurrency(ticket.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {tours.map((tour, index) => (
                        <div
                          key={tour.scheduleId}
                          className="space-y-2 rounded-lg bg-neutral-50 p-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-neutral-900">
                                {tour.tourTitle}
                              </p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                Tour
                              </Badge>
                            </div>
                            <span className="text-xs text-neutral-500">
                              #{tickets.length + index + 1}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            {tour.ticketTypeName && (
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Loại vé:</span>
                                <span className="font-medium">{tour.ticketTypeName}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Số người:</span>
                              <span className="font-medium">{tour.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Đơn giá/người:</span>
                              <span className="font-medium">{formatCurrency(tour.price)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between border-t border-neutral-200 pt-2">
                            <span className="text-sm font-medium text-neutral-700">
                              Thành tiền:
                            </span>
                            <span className="font-bold text-brand-600">
                              {formatCurrency(tour.price * tour.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {singerPackages.map((pkg, index) => (
                        <div
                          key={pkg.packageId}
                          className="space-y-3 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-neutral-900">
                                {pkg.packageName}
                              </p>
                              <Badge
                                variant="outline"
                                className="mt-1 border-green-300 bg-green-100 text-xs font-semibold text-green-800"
                              >
                                Gói ca sĩ
                              </Badge>
                            </div>
                            <span className="text-xs text-neutral-500">
                              #{tickets.length + tours.length + index + 1}
                            </span>
                          </div>

                          {pkg.description && (
                            <div className="border-b border-green-200 pb-2">
                              <p className="text-sm leading-relaxed text-neutral-700">
                                {pkg.description}
                              </p>
                            </div>
                          )}

                          {pkg.benefits && pkg.benefits.length > 0 && (
                            <div className="border-b border-green-200 pb-2">
                              <p className="mb-2 text-sm font-semibold text-green-800">
                                Quyền lợi:
                              </p>
                              <ul className="ml-1 space-y-1.5">
                                {pkg.benefits.map((benefit, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2 text-sm text-neutral-700"
                                  >
                                    <span className="mt-0.5 font-bold text-green-600">✓</span>
                                    <span className="flex-1 leading-relaxed">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="space-y-1 pt-1 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-neutral-600">Số lượng:</span>
                              <span className="font-semibold">{pkg.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-neutral-600">Đơn giá:</span>
                              <span className="font-semibold">{formatCurrency(pkg.price)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between border-t border-green-300 pt-2">
                            <span className="text-sm font-bold text-neutral-800">Thành tiền:</span>
                            <span className="text-base font-bold text-green-700">
                              {formatCurrency(pkg.price * pkg.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="space-y-3 rounded-lg border bg-white p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Số sản phẩm:</span>
                    <span className="font-medium">
                      {isBuyNowMode && booking
                        ? booking.items.reduce((sum, item) => sum + item.quantity, 0)
                        : tickets.length +
                          tours.reduce((sum, t) => sum + t.quantity, 0) +
                          singerPackages.reduce((sum, p) => sum + p.quantity, 0)}{' '}
                      mục
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tạm tính:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        isBuyNowMode && booking ? booking.totalAmount : getSubtotal()
                      )}
                    </span>
                  </div>

                  {isBuyNowMode && booking && booking.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-success-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(booking.discountAmount)}</span>
                    </div>
                  )}
                  {!isBuyNowMode && discount > 0 && (
                    <div className="flex justify-between text-sm text-success-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  {paymentDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm text-success-600">
                      <span>
                        Giảm giá thanh toán ({Number(selectedConfig?.discountPercentage)}%):
                      </span>
                      <span>-{formatCurrency(paymentDiscountAmount)}</span>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">Tổng cộng:</span>
                      <span className="text-xl font-bold text-brand-600">
                        {formatCurrency(finalTotalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing || isLoadingBooking}
                >
                  {isProcessing
                    ? 'Đang xử lý...'
                    : selectedMethod === 'BANK_QR'
                      ? 'Tạo mã QR thanh toán'
                      : `Thanh toán ${formatCurrency(finalTotalAmount)}`}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Thanh toán an toàn và bảo mật</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      <PaymentQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        defaultAmount={finalTotalAmount}
        defaultDescription={`Thanh toan don hang Music Travel - ${createdBookingCode || (isBuyNowMode && booking ? booking.bookingCode : 'Cart')}`}
        onSuccess={async () => {
          const code = createdBookingCode || (booking ? booking.bookingCode : '');
          if (code) {
            try {
              const response = await post(`/bookings/${code}/confirm-payment`, {});
              await queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
              await queryClient.invalidateQueries({ queryKey: ['my-show-bookings'] });
              await queryClient.invalidateQueries({ queryKey: ['my-singer-bookings'] });
              await queryClient.invalidateQueries({ queryKey: ['profile'] });
              await queryClient.invalidateQueries({ queryKey: ['wallet'] });
              toast.success('Xác nhận thanh toán thành công! Vui lòng đợi admin duyệt đơn hàng.');
              clearCart();
              setIsQRModalOpen(false);
              router.push(`/profile?booking=${code}`);
            } catch {
              toast.error('Có lỗi khi xác nhận thanh toán.');
            }
          } else {
            clearCart();
            router.push('/profile');
          }
        }}
      />
    </div>
  );
}
