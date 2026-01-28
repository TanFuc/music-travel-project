'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Link } from '@/components/common/Link';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Ticket, ExternalLink, Navigation, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';
import { GeneralAdmissionView } from '@/components/shows/GeneralAdmissionView';

// Dynamic imports for heavy components - improves initial page load
const SeatMap = dynamic(() => import('@/components/shows/SeatMap').then(mod => ({ default: mod.SeatMap })), {
  loading: () => (
    <div className="flex items-center justify-center p-12 min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
        <p className="text-sm text-muted-foreground">Đang tải sơ đồ...</p>
      </div>
    </div>
  ),
  ssr: false,
});

const LocationMap = dynamic(() => import('@/components/maps/LocationMap').then(mod => ({ default: mod.LocationMap })), {
  loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />,
  ssr: false,
});

interface TicketClass {
  id: number;
  name: string;
  price: number;
  colorCode: string | null;
  availableCount: number;
}

interface Artist {
  id: number;
  name: string;
  bio: string | null;
  socialLinks: Record<string, string> | null;
  isHeadline: boolean;
}

interface ShowDetail {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  performTime: string;
  checkInTime: string | null;
  status: string;
  branch: { id: number; name: string } | null;
  seatSelectionEnabled: boolean; // false = General Admission mode
  properties: Record<string, unknown> | null;
  metaTitle: string | null;
  metaDescription: string | null;
  stage: {
    id: number;
    name: string;
    address: string | null;
    mapLink: string | null;
    latitude?: number;
    longitude?: number;
    location: {
      id: number;
      name: string;
      latitude?: number;
      longitude?: number;
    };
  };
  artists: Artist[];
  ticketClasses: TicketClass[];
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  UPCOMING: 'success',
  ONGOING: 'warning',
  ENDED: 'secondary',
  CANCELLED: 'destructive',
};

const statusLabels: Record<string, string> = {
  UPCOMING: 'Sắp diễn ra',
  ONGOING: 'Đang diễn ra',
  ENDED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};

export default function ShowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const addTicket = useCartStore((state) => state.addTicket);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [showSeatMap, setShowSeatMap] = useState(true); // Show by default
  const [lockedSeats, setLockedSeats] = useState<{ lockId: string; expiresAt: Date } | null>(null);

  const { data: show, isLoading, error } = useQuery({
    queryKey: ['show', slug],
    queryFn: () => get<ShowDetail>(`/shows/${slug}`),
    enabled: !!slug,
  });

  const handleSeatsSelected = useCallback((ticketIds: number[], totalPrice: number) => {
    // Seats selected but not yet locked
    console.log(`Selected ${ticketIds.length} seats, total: ${totalPrice}`);
  }, []);

  const handleLockSuccess = (lockId: string, expiresAt: Date) => {
    setLockedSeats({ lockId, expiresAt });
    toast.success('Đã giữ chỗ thành công! Vui lòng thanh toán trong 10 phút.');
    // Optionally redirect to checkout
    // router.push(`/checkout?lockId=${lockId}`);
  };

  const handleAddToCart = (ticketClass: TicketClass) => {
    if (!show) return;

    addTicket({
      ticketId: Date.now(),
      showId: show.id,
      showTitle: show.title,
      ticketClassId: ticketClass.id,
      ticketClassName: ticketClass.name || 'Chung',
      price: ticketClass.price,
    });

    toast.success('Đã thêm vé vào giỏ hàng!');
    setSelectedClass(ticketClass.id);
    setTimeout(() => setSelectedClass(null), 1000);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-error-500 mb-4">Không thể tải thông tin sự kiện.</p>
          <Link href="/shows">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!show) return null;

  const isBookable = show.status === 'UPCOMING' || show.status === 'ONGOING';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back Button */}
      <Link href="/shows" prefetch={false} className="inline-flex items-center text-neutral-600 hover:text-brand-500 mb-4 sm:mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Hero Section */}
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 text-white p-6 sm:p-8 md:p-12">
            <div className="relative z-10">
              <Badge variant={statusColors[show.status]} className="mb-3 sm:mb-4">
                {statusLabels[show.status]}
              </Badge>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4">{show.title}</h1>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-sm sm:text-base text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDateTime(show.performTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{show.stage.name}{show.branch ? ` - ${show.branch.name}` : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {show.description && (
            <Card>
              <CardHeader>
                <CardTitle>Giới thiệu</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-neutral max-w-none"
                  dangerouslySetInnerHTML={{ __html: show.description }}
                />
              </CardContent>
            </Card>
          )}

          {/* Artists */}
          {show.artists.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Nghệ sĩ biểu diễn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {show.artists.map((artist) => (
                    <div
                      key={artist.id}
                      className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg"
                    >
                      <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-brand-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {artist.name}
                          {artist.isHeadline && (
                            <Badge variant="secondary" className="ml-2">
                              Headline
                            </Badge>
                          )}
                        </h4>
                        {artist.bio && (
                          <p className="text-sm text-neutral-600 line-clamp-2">{artist.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Venue Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Địa điểm tổ chức
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">{show.stage.name}</h4>
                <p className="text-neutral-600">{show.stage.address}</p>
                <p className="text-sm text-neutral-500">{show.stage.location.name}</p>
              </div>

              {/* Google Maps Integration */}
              {(show.stage.latitude && show.stage.longitude) ? (
                <LocationMap
                  latitude={show.stage.latitude}
                  longitude={show.stage.longitude}
                  title={show.stage.name}
                  address={show.stage.address || undefined}
                  height="300px"
                  className="mt-4"
                />
              ) : show.stage.mapLink ? (
                <a
                  href={show.stage.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-brand-500 hover:text-brand-600"
                >
                  <Navigation className="mr-1 h-4 w-4" />
                  Xem bản đồ
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              ) : null}

              {/* Directions Link */}
              {show.stage.latitude && show.stage.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${show.stage.latitude},${show.stage.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 mt-2"
                >
                  <Navigation className="h-4 w-4" />
                  Chỉ đường đến địa điểm
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              {show.checkInTime && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 mt-3">
                  <Clock className="h-4 w-4" />
                  <span>Mở cửa check-in: {formatDateTime(show.checkInTime)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seat Map / General Admission Section Removed - Replaced with Universal Ticket Note */}
          <Card className="bg-brand-50 border-brand-100">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                <Ticket className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Vui lòng mua vé để tham dự show diễn</h3>
                <p className="text-neutral-600 max-w-md mx-auto mt-1">
                  Chúng tôi hiện sử dụng hệ thống vé chung. Một tấm vé có thể tham dự bất kỳ show diễn nào trong hệ thống của Music Travel.
                </p>
              </div>
              <Link href="/tickets" prefetch={false}>
                <Button size="lg" className="px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-brand-200">
                  Mua vé ngay
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Simplified */}
        <div>
          <Card className="lg:sticky lg:top-24 overflow-hidden border-2 border-brand-100">
            <CardHeader className="bg-brand-50 border-b border-brand-100">
              <CardTitle className="flex items-center gap-2 text-brand-700">
                <Ticket className="h-5 w-5" />
                Thông tin tham dự
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-semibold text-sm">Vé không định danh</p>
                    <p className="text-xs text-neutral-500">Sử dụng cho bất kỳ show diễn nào bạn yêu thích.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-semibold text-sm">Check-in linh hoạt</p>
                    <p className="text-xs text-neutral-500">Chỉ cần mang theo mã vé đến điểm diễn để được hỗ trợ.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Link href="/tickets" prefetch={false}>
                  <Button className="w-full h-12 font-bold text-lg">
                    Mua vé ngay
                  </Button>
                </Link>
                <p className="text-[10px] text-center text-neutral-400 mt-3 uppercase tracking-wider">
                  Áp dụng cho mọi show diễn trên toàn quốc
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
