'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Ticket,
  User,
  Phone,
  Mail,
  CalendarClock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { get } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Link } from '@/components/common/Link';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
const formatDetailedDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  return date.toLocaleString('vi-VN', options);
};
const formatShortDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
interface BookingDetail {
  id: number;
  bookingCode: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotalAmount: number;
  discountAmount: number;
  finalAmount: number;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  confirmedAt?: string;
  user: {
    fullName: string;
    phoneNumber: string;
    email?: string;
  };
  items: Array<{
    id: number;
    itemType: string;
    itemTypeLabel: string;
    productName: string;
    itemId: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    show?: {
      title: string;
      description?: string;
      thumbnailUrl?: string;
      startDate: string;
      stage: {
        name: string;
        address: string;
      };
    };
    tour?: {
      title: string;
      description?: string;
      duration?: string;
      thumbnailUrl?: string;
      departureDate: string;
    };
    singerPackage?: {
      name: string;
      price: number;
      description?: string;
      benefits?: string[];
      colorCode?: string;
    };
    ticketClass?: {
      name: string;
      price: number;
      colorCode?: string;
    };
    ticketTier?: {
      name: string;
      price: number;
      description?: string;
      benefits?: string;
      colorCode?: string;
    };
  }>;
}
export default function BookingDetailPage() {
  usePageTitle('Chi tiết đơn hàng');
  const params = useParams();
  const router = useRouter();
  const bookingCode = params?.code as string;
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking-detail', bookingCode],
    queryFn: () => get<BookingDetail>(`/bookings/${bookingCode}/details`),
    enabled: !!bookingCode,
  });
  useEffect(() => {
    if (booking?.bookingCode) {
      QRCode.toDataURL(booking.bookingCode, {
        width: 200,
        margin: 2,
      }).then(setQrCodeUrl);
    }
  }, [booking?.bookingCode]);
  const getStatusConfig = () => {
    if (!booking) return { label: '', color: '', icon: Clock };
    if (booking.paymentStatus === 'UNPAID') {
      return {
        label: 'Chưa thanh toán',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Clock,
      };
    }
    if (booking.status === 'PENDING' || booking.status === 'MANUAL_REVIEW') {
      return {
        label: 'Chờ xử lý',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Clock,
      };
    }
    if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
      return {
        label: 'Đã xử lý',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: CheckCircle,
      };
    }
    if (booking.status === 'CANCELLED') {
      return { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle };
    }
    return {
      label: booking.status,
      color: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: Clock,
    };
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <Skeleton className="mb-6 h-10 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }
  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">Không tìm thấy đơn hàng</p>
              <Link href="/profile">
                <Button className="mt-4">Quay lại trang cá nhân</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const isProcessed = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
  const getDisplayProductName = (item: BookingDetail['items'][0]) => {
    if (item.productName && item.productName !== 'Sản phẩm không xác định') {
      return item.productName;
    }
    if (item.ticketClass) {
      return `Vé ${item.ticketClass.name}`;
    }
    if (item.ticketTier) {
      return `Vé ${item.ticketTier.name}`;
    }
    if (item.singerPackage) {
      return item.singerPackage.name;
    }
    return 'Sản phẩm';
  };
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-6">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Chi tiết đơn hàng</h1>
              <p className="mt-1 text-slate-500">
                Mã đơn hàng: <span className="font-mono font-semibold">#{booking.bookingCode}</span>
              </p>
            </div>
            <Badge className={`${statusConfig.color} border px-3 py-1.5 text-sm`}>
              <StatusIcon className="mr-1.5 h-4 w-4" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {isProcessed && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <div>
                      <h3 className="mb-1 font-semibold text-emerald-900">Hướng dẫn sử dụng vé</h3>
                      <p className="text-sm text-emerald-700">
                        Quý khách vui lòng đến quầy soát vé tại địa điểm đăng ký, xuất trình mã đơn
                        hàng hoặc QR code bên dưới để check-in.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Sản phẩm đã đặt ({booking.items.length} sản phẩm)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.items.map((item, index) => (
                  <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor:
                                item.ticketClass?.colorCode ||
                                item.ticketTier?.colorCode ||
                                item.singerPackage?.colorCode ||
                                '#6366f1',
                              color:
                                item.ticketClass?.colorCode ||
                                item.ticketTier?.colorCode ||
                                item.singerPackage?.colorCode ||
                                '#6366f1',
                            }}
                          >
                            {item.itemTypeLabel}
                          </Badge>
                          <span className="text-xs text-slate-400">#{index + 1}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900">
                          {getDisplayProductName(item)}
                        </h4>
                      </div>
                      {(item.show?.thumbnailUrl || item.tour?.thumbnailUrl) && (
                        <img
                          src={item.show?.thumbnailUrl || item.tour?.thumbnailUrl}
                          alt="Thumbnail"
                          className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                      {item.ticketClass && (
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-purple-500" />
                          <span className="text-slate-600">Hạng vé:</span>
                          <span
                            className="rounded px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: item.ticketClass.colorCode
                                ? `${item.ticketClass.colorCode}20`
                                : '#f1f5f9',
                              color: item.ticketClass.colorCode || '#475569',
                            }}
                          >
                            {item.ticketClass.name}
                          </span>
                        </div>
                      )}

                      {item.ticketTier && (
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-purple-500" />
                          <span className="text-slate-600">Hạng vé:</span>
                          <span
                            className="rounded px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: item.ticketTier.colorCode
                                ? `${item.ticketTier.colorCode}20`
                                : '#f1f5f9',
                              color: item.ticketTier.colorCode || '#475569',
                            }}
                          >
                            {item.ticketTier.name}
                          </span>
                        </div>
                      )}

                      {item.show && (
                        <>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span className="text-slate-600">Thời gian:</span>
                            <span className="font-medium">
                              {formatShortDateTime(item.show.startDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span className="text-slate-600">Địa điểm:</span>
                            <span className="font-medium">{item.show.stage.name}</span>
                          </div>
                          <div className="col-span-full pl-6 text-xs text-slate-500">
                            {item.show.stage.address}
                          </div>
                        </>
                      )}

                      {item.tour && (
                        <>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span className="text-slate-600">Khởi hành:</span>
                            <span className="font-medium">
                              {formatShortDateTime(item.tour.departureDate)}
                            </span>
                          </div>
                          {item.tour.duration && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="text-slate-600">Thời lượng:</span>
                              <span className="font-medium">{item.tour.duration}</span>
                            </div>
                          )}
                          {item.tour.description && (
                            <div className="col-span-full mt-1 text-xs text-slate-500">
                              {item.tour.description.substring(0, 150)}...
                            </div>
                          )}
                        </>
                      )}

                      {item.singerPackage && (
                        <>
                          {item.singerPackage.description && (
                            <div className="col-span-full text-xs text-slate-600">
                              {item.singerPackage.description}
                            </div>
                          )}
                          {item.singerPackage.benefits &&
                            Array.isArray(item.singerPackage.benefits) &&
                            item.singerPackage.benefits.length > 0 && (
                              <div className="col-span-full">
                                <p className="mb-1 text-xs text-slate-500">Quyền lợi:</p>
                                <ul className="space-y-0.5 text-xs text-slate-600">
                                  {(item.singerPackage.benefits as string[])
                                    .slice(0, 3)
                                    .map((benefit, i) => (
                                      <li key={i} className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                                        {benefit}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}
                        </>
                      )}

                      {item.ticketTier?.benefits && (
                        <div className="col-span-full text-xs text-slate-600">
                          <p className="mb-1 text-slate-500">Quyền lợi:</p>
                          {item.ticketTier.benefits}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Đơn giá:</span>
                            <span className="ml-2 text-slate-900">
                              {formatCurrency(item.unitPrice)}
                            </span>
                          </div>
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Số lượng:</span>
                            <span className="ml-2 text-slate-900">{item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Thành tiền</p>
                          <p className="text-lg font-bold text-brand-600">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-900">{booking.user.fullName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-900">{booking.user.phoneNumber}</span>
                </div>
                {booking.user.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-900">{booking.user.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <CalendarClock className="h-5 w-5" />
                  Thông tin ngày giờ chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-blue-100 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <div className="flex-1">
                      <p className="mb-1 text-sm font-semibold text-slate-900">Ngày tạo đơn hàng</p>
                      <p className="text-sm text-slate-600">
                        {formatDetailedDate(booking.createdAt)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">ID đơn hàng: #{booking.id}</p>
                    </div>
                  </div>
                </div>

                {booking.paymentStatus === 'PAID' && (
                  <div className="rounded-lg border border-emerald-100 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <CreditCard className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                      <div className="flex-1">
                        <p className="mb-1 text-sm font-semibold text-slate-900">Ngày thanh toán</p>
                        <p className="text-sm text-slate-600">
                          {booking.paidAt
                            ? formatDetailedDate(booking.paidAt)
                            : formatDetailedDate(booking.updatedAt)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Phương thức:{' '}
                          {booking.paymentMethod === 'WALLET'
                            ? 'Ví điện tử'
                            : booking.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isProcessed && (
                  <div className="rounded-lg border border-emerald-100 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                      <div className="flex-1">
                        <p className="mb-1 text-sm font-semibold text-slate-900">
                          Ngày duyệt đơn hàng
                        </p>
                        <p className="text-sm text-slate-600">
                          {booking.confirmedAt
                            ? formatDetailedDate(booking.confirmedAt)
                            : formatDetailedDate(booking.updatedAt)}
                        </p>
                        <p className="mt-1 text-xs text-emerald-600">
                          ✓ Đơn hàng đã được xác nhận và sẵn sàng sử dụng
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {booking.items.some((item) => item.show) && (
                  <div className="rounded-lg border border-purple-100 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                      <div className="flex-1">
                        <p className="mb-2 text-sm font-semibold text-slate-900">
                          Ngày diễn ra sự kiện
                        </p>
                        {booking.items
                          .filter((item) => item.show)
                          .map((item, index) => (
                            <div key={index} className="mb-2 last:mb-0">
                              <p className="text-sm font-medium text-slate-700">
                                {item.show?.title}
                              </p>
                              <p className="text-sm text-slate-600">
                                {formatDetailedDate(item.show!.startDate)}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                <MapPin className="mr-1 inline h-3 w-3" />
                                {item.show?.stage.name} - {item.show?.stage.address}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {booking.items.some((item) => item.tour) && (
                  <div className="rounded-lg border border-purple-100 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                      <div className="flex-1">
                        <p className="mb-2 text-sm font-semibold text-slate-900">
                          Ngày khởi hành tour
                        </p>
                        {booking.items
                          .filter((item) => item.tour)
                          .map((item, index) => (
                            <div key={index} className="mb-2 last:mb-0">
                              <p className="text-sm font-medium text-slate-700">
                                {item.tour?.title}
                              </p>
                              <p className="text-sm text-slate-600">
                                {formatDetailedDate(item.tour!.departureDate)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-slate-100 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                    <div className="flex-1">
                      <p className="mb-1 text-sm font-semibold text-slate-900">Cập nhật lần cuối</p>
                      <p className="text-sm text-slate-600">
                        {formatDetailedDate(booking.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {isProcessed && qrCodeUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">QR Code Check-in</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <img src={qrCodeUrl} alt="QR Code" className="h-48 w-48" />
                  <p className="mt-2 text-center text-xs text-slate-500">
                    Xuất trình mã này tại quầy check-in
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tạm tính</span>
                  <span className="font-medium">{formatCurrency(booking.subtotalAmount)}</span>
                </div>
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Giảm giá</span>
                    <span className="font-medium text-emerald-600">
                      -{formatCurrency(booking.discountAmount)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-lg font-bold text-brand-600">
                    {formatCurrency(booking.finalAmount)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-slate-600">Phương thức thanh toán</p>
                  <p className="mt-1 font-medium">
                    {booking.paymentMethod === 'WALLET' ? 'Ví điện tử' : booking.paymentMethod}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Lịch sử đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-brand-600" />
                    <div className="mt-1 h-full w-0.5 bg-slate-200" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-slate-900">Đơn hàng đã tạo</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatShortDateTime(booking.createdAt)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">Mã đơn: {booking.bookingCode}</p>
                  </div>
                </div>
                {booking.paymentStatus === 'PAID' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-emerald-600" />
                      {isProcessed && <div className="mt-1 h-full w-0.5 bg-slate-200" />}
                    </div>
                    <div className={`flex-1 ${isProcessed ? 'pb-4' : ''}`}>
                      <p className="text-sm font-medium text-emerald-700">Đã thanh toán</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {booking.paidAt
                          ? formatShortDateTime(booking.paidAt)
                          : formatShortDateTime(booking.updatedAt)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {booking.paymentMethod === 'WALLET' ? 'Ví điện tử' : booking.paymentMethod}
                      </p>
                    </div>
                  </div>
                )}
                {isProcessed && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-700">Đã xử lý</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {booking.confirmedAt
                          ? formatShortDateTime(booking.confirmedAt)
                          : formatShortDateTime(booking.updatedAt)}
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-600">✓ Vé đã sẵn sàng sử dụng</p>
                    </div>
                  </div>
                )}
                {booking.status === 'CANCELLED' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-700">Đã hủy</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatShortDateTime(booking.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
