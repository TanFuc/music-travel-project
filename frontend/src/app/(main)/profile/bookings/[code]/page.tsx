'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Package, CreditCard, CheckCircle, Clock, XCircle, Ticket, User, Phone, Mail, Download, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { get } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Link } from '@/components/common/Link';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

// Detailed date formatter
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
    itemId: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    show?: {
      title: string;
      thumbnailUrl?: string;
      startDate: string;
      stage: {
        name: string;
        address: string;
      };
    };
    tour?: {
      title: string;
      thumbnailUrl?: string;
      departureDate: string;
    };
    singerPackage?: {
      name: string;
      description?: string;
    };
    ticketClass?: {
      name: string;
      description?: string;
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

  // Generate QR code
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
      return { label: 'Chưa thanh toán', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock };
    }
    if (booking.paymentStatus === 'PAID' && booking.status === 'PENDING') {
      return { label: 'Chờ xử lý', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock };
    }
    if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
      return { label: 'Đã duyệt', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle };
    }
    if (booking.status === 'CANCELLED') {
      return { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle };
    }
    return { label: booking.status, color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <Skeleton className="h-10 w-48 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container max-w-4xl mx-auto px-4">
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
  const isApproved = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/profile">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Chi tiết đơn hàng</h1>
              <p className="text-slate-500 mt-1">Mã đơn hàng: <span className="font-mono font-semibold">#{booking.bookingCode}</span></p>
            </div>
            <Badge className={`${statusConfig.color} border px-3 py-1.5 text-sm`}>
              <StatusIcon className="h-4 w-4 mr-1.5" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Check-in Instructions */}
            {isApproved && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-emerald-900 mb-1">Hướng dẫn sử dụng vé</h3>
                      <p className="text-sm text-emerald-700">
                        Quý khách vui lòng đến quầy soát vé tại địa điểm đăng ký, xuất trình mã đơn hàng hoặc QR code bên dưới để check-in.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Sản phẩm đã đặt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                    {(item.show?.thumbnailUrl || item.tour?.thumbnailUrl) && (
                      <img
                        src={item.show?.thumbnailUrl || item.tour?.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">
                        {item.show?.title || item.tour?.title || item.singerPackage?.name}
                      </h4>
                      {item.ticketClass && (
                        <p className="text-sm text-slate-600 mt-1">Hạng vé: {item.ticketClass.name}</p>
                      )}
                      {item.show && (
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="h-3.5 w-3.5 text-purple-500" />
                            <span className="font-medium">{formatShortDateTime(item.show.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{item.show.stage.name}</span>
                          </div>
                          <p className="text-xs text-slate-400 pl-5">{item.show.stage.address}</p>
                        </div>
                      )}
                      {item.tour && (
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="h-3.5 w-3.5 text-purple-500" />
                            <span className="font-medium">{formatShortDateTime(item.tour.departureDate)}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-slate-600">Số lượng: {item.quantity}</span>
                        <span className="font-semibold text-brand-600">{formatCurrency(item.subtotal)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Customer Info */}
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

            {/* Detailed Date/Time Information */}
            <Card className="border-blue-100 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <CalendarClock className="h-5 w-5" />
                  Thông tin ngày giờ chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900 mb-1">Ngày tạo đơn hàng</p>
                      <p className="text-sm text-slate-600">{formatDetailedDate(booking.createdAt)}</p>
                      <p className="text-xs text-slate-400 mt-1">ID đơn hàng: #{booking.id}</p>
                    </div>
                  </div>
                </div>

                {booking.paymentStatus === 'PAID' && (
                  <div className="bg-white rounded-lg p-4 border border-emerald-100">
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900 mb-1">Ngày thanh toán</p>
                        <p className="text-sm text-slate-600">
                          {booking.paidAt ? formatDetailedDate(booking.paidAt) : formatDetailedDate(booking.updatedAt)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Phương thức: {booking.paymentMethod === 'WALLET' ? 'Ví điện tử' : booking.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isApproved && (
                  <div className="bg-white rounded-lg p-4 border border-emerald-100">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900 mb-1">Ngày duyệt đơn hàng</p>
                        <p className="text-sm text-slate-600">
                          {booking.confirmedAt ? formatDetailedDate(booking.confirmedAt) : formatDetailedDate(booking.updatedAt)}
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">✓ Đơn hàng đã được xác nhận và sẵn sàng sử dụng</p>
                      </div>
                    </div>
                  </div>
                )}

                {booking.items.some(item => item.show) && (
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900 mb-2">Ngày diễn ra sự kiện</p>
                        {booking.items.filter(item => item.show).map((item, index) => (
                          <div key={index} className="mb-2 last:mb-0">
                            <p className="text-sm font-medium text-slate-700">{item.show?.title}</p>
                            <p className="text-sm text-slate-600">{formatDetailedDate(item.show!.startDate)}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {item.show?.stage.name} - {item.show?.stage.address}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {booking.items.some(item => item.tour) && (
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900 mb-2">Ngày khởi hành tour</p>
                        {booking.items.filter(item => item.tour).map((item, index) => (
                          <div key={index} className="mb-2 last:mb-0">
                            <p className="text-sm font-medium text-slate-700">{item.tour?.title}</p>
                            <p className="text-sm text-slate-600">{formatDetailedDate(item.tour!.departureDate)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-lg p-4 border border-slate-100">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900 mb-1">Cập nhật lần cuối</p>
                      <p className="text-sm text-slate-600">{formatDetailedDate(booking.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code */}
            {isApproved && qrCodeUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">QR Code Check-in</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Xuất trình mã này tại quầy check-in
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Payment Summary */}
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
                    <span className="font-medium text-emerald-600">-{formatCurrency(booking.discountAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="font-bold text-brand-600 text-lg">{formatCurrency(booking.finalAmount)}</span>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-slate-600">Phương thức thanh toán</p>
                  <p className="font-medium mt-1">{booking.paymentMethod === 'WALLET' ? 'Ví điện tử' : booking.paymentMethod}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
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
                    <div className="w-2 h-2 rounded-full bg-brand-600" />
                    <div className="w-0.5 h-full bg-slate-200 mt-1" />
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="font-medium text-sm text-slate-900">Đơn hàng đã tạo</p>
                    <p className="text-xs text-slate-500 mt-1">{formatShortDateTime(booking.createdAt)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Mã đơn: {booking.bookingCode}</p>
                  </div>
                </div>
                {booking.paymentStatus === 'PAID' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                      {isApproved && <div className="w-0.5 h-full bg-slate-200 mt-1" />}
                    </div>
                    <div className={`flex-1 ${isApproved ? 'pb-4' : ''}`}>
                      <p className="font-medium text-sm text-emerald-700">Đã thanh toán</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {booking.paidAt ? formatShortDateTime(booking.paidAt) : formatShortDateTime(booking.updatedAt)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {booking.paymentMethod === 'WALLET' ? 'Ví điện tử' : booking.paymentMethod}
                      </p>
                    </div>
                  </div>
                )}
                {isApproved && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-emerald-700">Đã duyệt</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {booking.confirmedAt ? formatShortDateTime(booking.confirmedAt) : formatShortDateTime(booking.updatedAt)}
                      </p>
                      <p className="text-xs text-emerald-600 mt-0.5">✓ Vé đã sẵn sàng sử dụng</p>
                    </div>
                  </div>
                )}
                {booking.status === 'CANCELLED' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-red-700">Đã hủy</p>
                      <p className="text-xs text-slate-500 mt-1">{formatShortDateTime(booking.updatedAt)}</p>
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
