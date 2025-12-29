'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Wallet, Building2, ShieldCheck, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { post } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const checkoutSchema = z.object({
  paymentMethod: z.enum(['WALLET', 'MOMO', 'VNPAY', 'BANKING']),
  voucherCode: z.string().optional(),
  note: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface VoucherValidation {
  valid: boolean;
  discountAmount: number;
  message: string;
}

const paymentMethods = [
  {
    id: 'WALLET',
    name: 'Vi cua toi',
    description: 'Thanh toan bang so du vi',
    icon: Wallet,
  },
  {
    id: 'MOMO',
    name: 'MoMo',
    description: 'Vi dien tu MoMo',
    icon: CreditCard,
  },
  {
    id: 'VNPAY',
    name: 'VNPAY',
    description: 'Cong thanh toan VNPAY',
    icon: CreditCard,
  },
  {
    id: 'BANKING',
    name: 'Chuyen khoan',
    description: 'Chuyen khoan ngan hang',
    icon: Building2,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { tickets, tours, getSubtotal, getTotal, discount, voucherCode, setVoucher, clearVoucher, clearCart } =
    useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherInput, setVoucherInput] = useState(voucherCode || '');

  const isEmpty = tickets.length === 0 && tours.length === 0;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isEmpty) {
      router.push('/cart');
    }
  }, [isEmpty, router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'WALLET',
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
    setIsProcessing(true);
    try {
      const bookingData = {
        items: [
          ...tickets.map((t) => ({
            type: 'SHOW_TICKET',
            ticketId: t.ticketId,
          })),
          ...tours.map((t) => ({
            type: 'TOUR',
            scheduleId: t.scheduleId,
            quantity: t.quantity,
          })),
        ],
        paymentMethod: data.paymentMethod,
        voucherCode: data.voucherCode || undefined,
        note: data.note || undefined,
      };

      const result = await post<{ bookingCode: string; redirectUrl?: string }>(
        '/bookings',
        bookingData
      );

      clearCart();

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        toast.success('Dat hang thanh cong!');
        router.push(`/profile?booking=${result.bookingCode}`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Dat hang that bai. Vui long thu lai.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || isEmpty) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/cart" className="inline-flex items-center text-neutral-600 hover:text-brand-500 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lai gio hang
      </Link>

      <h1 className="text-3xl font-display font-bold mb-8">Thanh Toan</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Method */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Phuong thuc thanh toan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMethod === method.id
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
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedMethod === method.id ? 'bg-brand-500 text-white' : 'bg-neutral-100'
                      }`}
                    >
                      <method.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{method.name}</h4>
                      <p className="text-sm text-neutral-500">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && (
                      <Badge variant="success">Da chon</Badge>
                    )}
                  </label>
                ))}
                {errors.paymentMethod && (
                  <p className="text-sm text-error-500">{errors.paymentMethod.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Voucher */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Ma giam gia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhap ma giam gia"
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
                    {isValidatingVoucher ? 'Dang kiem tra...' : 'Ap dung'}
                  </Button>
                </div>
                {voucherCode && discount > 0 && (
                  <div className="mt-3 p-3 bg-success-50 rounded-lg flex items-center justify-between">
                    <span className="text-success-600 text-sm">
                      Ma {voucherCode}: Giam {formatCurrency(discount)}
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
                      Xoa
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Note */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chu</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  {...register('note')}
                  placeholder="Ghi chu cho don hang (tuy chon)"
                  className="w-full p-3 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Chi tiet don hang</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.ticketId}
                      className="flex justify-between text-sm py-2 border-b"
                    >
                      <div>
                        <p className="font-medium">{ticket.showTitle}</p>
                        <p className="text-neutral-500">{ticket.ticketClassName}</p>
                      </div>
                      <span>{formatCurrency(ticket.price)}</span>
                    </div>
                  ))}
                  {tours.map((tour) => (
                    <div
                      key={tour.scheduleId}
                      className="flex justify-between text-sm py-2 border-b"
                    >
                      <div>
                        <p className="font-medium">{tour.tourTitle}</p>
                        <p className="text-neutral-500">{tour.quantity} nguoi</p>
                      </div>
                      <span>{formatCurrency(tour.price * tour.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tam tinh</span>
                    <span>{formatCurrency(getSubtotal())}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-success-600">
                      <span>Giam gia</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Tong cong</span>
                      <span className="text-brand-600">{formatCurrency(getTotal())}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Dang xu ly...' : 'Xac nhan thanh toan'}
                </Button>

                {/* Security Note */}
                <div className="flex items-center gap-2 text-xs text-neutral-500 justify-center">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Thanh toan an toan va bao mat</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
