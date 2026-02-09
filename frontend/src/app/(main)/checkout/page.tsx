'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/components/common/Link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Wallet, Building2, ShieldCheck, Tag, Banknote, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { get, post } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import PaymentQRModal from '@/components/payment/PaymentQRModal';

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

const paymentMethods = [
  {
    id: 'BANK_QR',
    name: 'QR Ngân hàng',
    description: 'Thanh toán bằng mã QR',
    icon: QrCode,
  },
  {
    id: 'MOMO',
    name: 'MoMo',
    description: 'Ví điện tử MoMo',
    icon: CreditCard,
  },
  {
    id: 'CASH',
    name: 'Tiền mặt',
    description: 'Thanh toán tại quầy',
    icon: Banknote,
  },
  // {
  //   id: 'WALLET',
  //   name: 'Ví của tôi',
  //   description: 'Thanh toán bằng số dư ví',
  //   icon: Wallet,
  // },
  // {
  //   id: 'VNPAY',
  //   name: 'VNPAY',
  //   description: 'Cổng thanh toán VNPAY',
  //   icon: CreditCard,
  // },
  // {
  //   id: 'BANKING',
  //   name: 'Chuyển khoản',
  //   description: 'Chuyển khoản ngân hàng',
  //   icon: Building2,
  // },
];

export default function CheckoutPage() {
  usePageTitle();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingCode = searchParams.get('code');

  const { isAuthenticated } = useAuthStore();
  const {
    tickets,
    tours,
    ticketTiers,
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
    removeTicketTier,
    removeSingerPackage
  } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherInput, setVoucherInput] = useState(voucherCode || '');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [createdBookingCode, setCreatedBookingCode] = useState<string | null>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Check if we're in "Buy Now" mode (has booking code) or "Cart" mode
  const isBuyNowMode = !!bookingCode;
  const isEmpty = !isBuyNowMode && tickets.length === 0 && tours.length === 0 && ticketTiers.length === 0;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isEmpty && !isBuyNowMode) {
      router.push('/cart');
    }
  }, [isEmpty, isBuyNowMode, router]);

  // Load booking if in "Buy Now" mode
  useEffect(() => {
    if (bookingCode && isAuthenticated) {
      setIsLoadingBooking(true);
      get<Booking>(`/bookings/${bookingCode}`)
        .then(data => {
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
    console.log('data', data);
    
    // Handle QR payment (Bank QR or Momo): Create booking first (if needed), then show modal
    if (['BANK_QR', 'MOMO'].includes(data.paymentMethod)) {
      setIsProcessing(true);
      try {
        let currentBookingCode = bookingCode;
        if (booking) {
          currentBookingCode = booking.bookingCode;
        }

        if (!isBuyNowMode) {
          // Create booking first
          const bookingPayload: {
            ticketsWithSeats?: Array<{ ticketId: number }>;
            ticketTiers?: Array<{ tierId: number; quantity: number }>;
            tourItems?: Array<{ scheduleId: number; quantity: number }>;
            singerPackages?: Array<{ packageId: string; quantity: number }>;
            voucherCode?: string;
            note?: string;
          } = {};

          if (tickets.length) {
            bookingPayload.ticketsWithSeats = tickets.map((t) => ({ ticketId: t.ticketId }));
          }
          if (ticketTiers.length) {
            bookingPayload.ticketTiers = ticketTiers.map((t) => ({ tierId: t.tierId, quantity: t.quantity }));
          }
          if (tours.length) {
            bookingPayload.tourItems = tours.map((t) => ({ scheduleId: t.scheduleId, quantity: t.quantity }));
          }
          if (singerPackages.length) {
            bookingPayload.singerPackages = singerPackages.map((p) => ({ packageId: p.packageId, quantity: p.quantity }));
          }
          if (data.voucherCode?.trim()) {
            bookingPayload.voucherCode = data.voucherCode.trim();
          }
          if (data.note?.trim()) {
            bookingPayload.note = data.note.trim();
          }

          const createResult = await post<{ bookingCode: string }>('/bookings', bookingPayload);
          currentBookingCode = createResult.bookingCode;
        }

        if (currentBookingCode) {
          setCreatedBookingCode(currentBookingCode);
          setIsQRModalOpen(true);
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setIsProcessing(true);
    try {
      if (isBuyNowMode && booking) {
        // Buy Now mode: Process payment for existing booking
        const result = await post<{ paymentUrl?: string }>('/payments/checkout', {
          bookingCode: booking.bookingCode,
          paymentMethod: data.paymentMethod,
        });

        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          booking.items.forEach(item => {
            if (item.ticketTier) {
              removeTicketTier(item.ticketTier.id);
            } else if (item.tourSchedule) {
              removeTour(item.tourSchedule.id);
            } else if (item.ticket) {
              removeTicket(item.ticket.id);
            }
          });
          toast.success('Thanh toán thành công!');
          router.push(`/profile?booking=${booking.bookingCode}`);
        }
      } else {
        // Cart mode: Build payload that matches backend CreateBookingDto exactly (no "items", no "paymentMethod")
        const bookingPayload: {
          ticketsWithSeats?: Array<{ ticketId: number }>;
          ticketTiers?: Array<{ tierId: number; quantity: number }>;
          tourItems?: Array<{ scheduleId: number; quantity: number }>;
          singerPackages?: Array<{ packageId: string; quantity: number }>;
          voucherCode?: string;
          note?: string;
        } = {};

        if (tickets.length) {
          bookingPayload.ticketsWithSeats = tickets.map((t) => ({ ticketId: t.ticketId }));
        }
        if (ticketTiers.length) {
          bookingPayload.ticketTiers = ticketTiers.map((t) => ({ tierId: t.tierId, quantity: t.quantity }));
        }
        if (tours.length) {
          bookingPayload.tourItems = tours.map((t) => ({ scheduleId: t.scheduleId, quantity: t.quantity }));
        }
        if (singerPackages.length) {
          bookingPayload.singerPackages = singerPackages.map((p) => ({ packageId: p.packageId, quantity: p.quantity }));
        }
        if (data.voucherCode?.trim()) {
          bookingPayload.voucherCode = data.voucherCode.trim();
        }
        if (data.note?.trim()) {
          bookingPayload.note = data.note.trim();
        }

        const createResult = await post<{ bookingCode: string }>('/bookings', bookingPayload);

        // Then process payment (checkout)
        const checkoutResult = await post<{ paymentUrl?: string }>('/payments/checkout', {
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
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || isEmpty) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back Button */}
      <Link href="/cart" prefetch={false} className="inline-flex items-center text-neutral-600 hover:text-brand-500 mb-4 sm:mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại giỏ hàng
      </Link>

      <h1 className="text-2xl sm:text-3xl font-display font-bold mb-6 sm:mb-8">Thanh Toán</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Payment Method */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${selectedMethod === method.id
                      ? 'border-brand-500 bg-brand-50'
                      : 'hover:border-neutral-300'
                      }`}
                  >
                    <input
                      type="radio"
                      value={method.id}
                      {...register('paymentMethod')}
                      className="sr-only"
                    />
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${selectedMethod === method.id ? 'bg-brand-500 text-white' : 'bg-neutral-100'
                        }`}
                    >
                      <method.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base">{method.name}</h4>
                      <p className="text-xs sm:text-sm text-neutral-500">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && (
                      <Badge variant="success" className="hidden sm:inline-flex">Đã chọn</Badge>
                    )}
                  </label>
                ))}
                {errors.paymentMethod && (
                  <p className="text-sm text-error-500">{errors.paymentMethod.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Voucher - Only in Cart mode */}
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
                    <div className="mt-3 p-3 bg-success-50 rounded-lg flex items-center justify-between">
                      <span className="text-success-600 text-sm">
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
                        className="text-neutral-500 h-auto py-1"
                      >
                        Xóa
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Note */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  {...register('note')}
                  placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                  className="w-full p-3 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle>Chi tiết đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {isBuyNowMode && booking ? (
                    // Buy Now mode: Show detailed booking items
                    <>
                      {booking.items.map((item, index) => {
                        const isTicket = item.itemType === 'SHOW_TICKET';
                        const isTour = item.itemType === 'TOUR_SLOT';
                        const isSingerPackage = item.itemType === 'SINGER_PACKAGE';

                        // Get item details
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
                          <div key={item.id} className={`rounded-lg p-4 space-y-3 ${isSingerPackage ? 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200' : 'bg-neutral-50'}`}>
                            {/* Item Header */}
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-neutral-900 truncate">
                                  {isTicket 
                                    ? (showTitle || 'Vé xem show') 
                                    : isTour 
                                      ? (tourTitle || 'Tour du lịch')
                                      : (packageName || 'Gói ca sĩ')
                                  }
                                </p>
                                {/* Item Type Badge */}
                                <Badge 
                                  variant="outline" 
                                  className={`mt-1 text-xs ${isSingerPackage ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                                >
                                  {isTicket ? 'Vé xem show' : isTour ? 'Tour' : 'Gói ca sĩ'}
                                </Badge>
                              </div>
                              <span className="text-xs text-neutral-500">#{index + 1}</span>
                            </div>

                            {/* Item Details */}
                            <div className="space-y-2 text-sm">
                              {/* Singer Package Description */}
                              {isSingerPackage && packageDescription && (
                                <div className="pb-2 border-b border-green-200">
                                  <p className="text-neutral-700 leading-relaxed">{packageDescription}</p>
                                </div>
                              )}

                              {/* Singer Package Benefits */}
                              {isSingerPackage && packageBenefits && packageBenefits.length > 0 && (
                                <div className="pb-2 border-b border-green-200">
                                  <p className="font-semibold text-green-800 mb-2">Quyền lợi:</p>
                                  <ul className="space-y-1.5 ml-1">
                                    {packageBenefits.map((benefit, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-neutral-700">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span className="flex-1 leading-relaxed">{benefit}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Ticket Tier or Class */}
                              {(ticketTierName || ticketClassName) && (
                                <div className="flex justify-between">
                                  <span className="text-neutral-600">Loại vé:</span>
                                  <span className="font-medium">{ticketTierName || ticketClassName}</span>
                                </div>
                              )}

                              {/* Seat Info */}
                              {seatInfo && (
                                <div className="flex justify-between">
                                  <span className="text-neutral-600">Vị trí:</span>
                                  <span className="font-medium">{seatInfo}</span>
                                </div>
                              )}

                              {/* Tour Schedule */}
                              {isTour && item.tourSchedule?.startDate && (
                                <div className="flex justify-between">
                                  <span className="text-neutral-600">Ngày khởi hành:</span>
                                  <span className="font-medium">
                                    {new Date(item.tourSchedule.startDate).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                              )}

                              {/* Quantity */}
                              <div className="flex justify-between pt-1 border-t border-neutral-200">
                                <span className="text-neutral-600 font-medium">Số lượng:</span>
                                <span className="font-semibold">{item.quantity}</span>
                              </div>

                              {/* Unit Price */}
                              <div className="flex justify-between">
                                <span className="text-neutral-600 font-medium">Đơn giá:</span>
                                <span className="font-semibold">{formatCurrency(unitPrice)}</span>
                              </div>
                            </div>

                            {/* Item Total */}
                            <div className="flex justify-between pt-2 border-t border-neutral-200">
                              <span className="text-sm font-medium text-neutral-700">Thành tiền:</span>
                              <span className="font-bold text-brand-600">{formatCurrency(totalPrice)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    // Cart mode: Show cart items with detailed breakdown
                    <>
                      {ticketTiers.map((tier, index) => (
                        <div key={tier.tierId} className="bg-neutral-50 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-neutral-900 truncate">{tier.tierName}</p>
                              <Badge variant="outline" className="mt-1 text-xs">Vé xem show</Badge>
                            </div>
                            <span className="text-xs text-neutral-500">#{index + 1}</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Số lượng:</span>
                              <span className="font-medium">{tier.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Đơn giá:</span>
                              <span className="font-medium">{formatCurrency(tier.price)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-neutral-200">
                            <span className="text-sm font-medium text-neutral-700">Thành tiền:</span>
                            <span className="font-bold text-brand-600">{formatCurrency(tier.price * tier.quantity)}</span>
                          </div>
                        </div>
                      ))}
                      {tickets.map((ticket, index) => (
                        <div key={ticket.ticketId} className="bg-neutral-50 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-neutral-900 truncate">{ticket.showTitle}</p>
                              <Badge variant="outline" className="mt-1 text-xs">Vé xem show</Badge>
                            </div>
                            <span className="text-xs text-neutral-500">#{ticketTiers.length + index + 1}</span>
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
                          <div className="flex justify-between pt-2 border-t border-neutral-200">
                            <span className="text-sm font-medium text-neutral-700">Thành tiền:</span>
                            <span className="font-bold text-brand-600">{formatCurrency(ticket.price)}</span>
                          </div>
                        </div>
                      ))}
                      {tours.map((tour, index) => (
                        <div key={tour.scheduleId} className="bg-neutral-50 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-neutral-900 truncate">{tour.tourTitle}</p>
                              <Badge variant="outline" className="mt-1 text-xs">Tour</Badge>
                            </div>
                            <span className="text-xs text-neutral-500">#{ticketTiers.length + tickets.length + index + 1}</span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Số người:</span>
                              <span className="font-medium">{tour.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Đơn giá/người:</span>
                              <span className="font-medium">{formatCurrency(tour.price)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-neutral-200">
                            <span className="text-sm font-medium text-neutral-700">Thành tiền:</span>
                            <span className="font-bold text-brand-600">{formatCurrency(tour.price * tour.quantity)}</span>
                          </div>
                        </div>
                      ))}
                      {singerPackages.map((pkg, index) => (
                        <div key={pkg.packageId} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-neutral-900">{pkg.packageName}</p>
                              <Badge variant="outline" className="mt-1 text-xs bg-green-100 text-green-800 border-green-300 font-semibold">Gói ca sĩ</Badge>
                            </div>
                            <span className="text-xs text-neutral-500">#{ticketTiers.length + tickets.length + tours.length + index + 1}</span>
                          </div>

                          {/* Package Description */}
                          {pkg.description && (
                            <div className="pb-2 border-b border-green-200">
                              <p className="text-sm text-neutral-700 leading-relaxed">{pkg.description}</p>
                            </div>
                          )}

                          {/* Package Benefits */}
                          {pkg.benefits && pkg.benefits.length > 0 && (
                            <div className="pb-2 border-b border-green-200">
                              <p className="text-sm font-semibold text-green-800 mb-2">Quyền lợi:</p>
                              <ul className="space-y-1.5 ml-1">
                                {pkg.benefits.map((benefit, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-neutral-700">
                                    <span className="text-green-600 mt-0.5 font-bold">✓</span>
                                    <span className="flex-1 leading-relaxed">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="space-y-1 text-sm pt-1">
                            <div className="flex justify-between">
                              <span className="text-neutral-600 font-medium">Số lượng:</span>
                              <span className="font-semibold">{pkg.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600 font-medium">Đơn giá:</span>
                              <span className="font-semibold">{formatCurrency(pkg.price)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-green-300">
                            <span className="text-sm font-bold text-neutral-800">Thành tiền:</span>
                            <span className="font-bold text-green-700 text-base">{formatCurrency(pkg.price * pkg.quantity)}</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-white border rounded-lg p-4 space-y-3">
                  {/* Item Count */}
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Số sản phẩm:</span>
                    <span className="font-medium">
                      {isBuyNowMode && booking
                        ? booking.items.reduce((sum, item) => sum + item.quantity, 0)
                        : ticketTiers.reduce((sum, t) => sum + t.quantity, 0) + tickets.length + tours.reduce((sum, t) => sum + t.quantity, 0) + singerPackages.reduce((sum, p) => sum + p.quantity, 0)
                      } mục
                    </span>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tạm tính:</span>
                    <span className="font-medium">{formatCurrency(isBuyNowMode && booking ? booking.totalAmount : getSubtotal())}</span>
                  </div>

                  {/* Discount */}
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

                  {/* Total */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Tổng cộng:</span>
                      <span className="font-bold text-xl text-brand-600">
                        {formatCurrency(isBuyNowMode && booking ? booking.finalAmount : getTotal())}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing || isLoadingBooking}
                >
                  {isProcessing ? 'Đang xử lý...' : selectedMethod === 'BANK_QR' ? 'Tạo mã QR thanh toán' : 'Xác nhận thanh toán'}
                </Button>

                {/* Security Note */}
                <div className="flex items-center gap-2 text-xs text-neutral-500 justify-center">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Thanh toán an toàn và bảo mật</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* QR Payment Modal */}
      <PaymentQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        defaultAmount={isBuyNowMode && booking ? booking.finalAmount : getTotal()}
        defaultDescription={`Thanh toan don hang Music Travel - ${isBuyNowMode && booking ? booking.bookingCode : 'Cart'}`}
        onSuccess={() => {createdBookingCode || (isBuyNowMode && booking ? booking.bookingCode : 'Cart')}`}
        onSuccess={() => {
          toast.success('Xác nhận thanh toán thành công!');
          clearCart();
          const code = createdBookingCode || (booking ? booking.bookingCode : '');
          if (code) {
             router.push(`/profile?booking=${code}`);
          } else {
           }
        }}
      />
    </div>
  );
}
