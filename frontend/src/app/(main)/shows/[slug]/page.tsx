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
import { usePageTitle } from '@/hooks/usePageTitle';

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
  thumbnailUrl?: string | null;
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

  // Dynamic page title based on show data
  usePageTitle(show?.title, isLoading);

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
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* 1. Hero Banner Background */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        {show.properties?.bannerUrl || show.thumbnailUrl ? (
          <img
            src={(show.properties?.bannerUrl as string) || show.thumbnailUrl || ''}
            alt={show.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-300" />
        )}
        {/* Gradient Overlay for text readability if needed, or just partial */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Back Button (Absolute) */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <Link 
            href="/shows" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40 transition-all font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* 2. Header Card (Floating) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-100 border border-neutral-100/50">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant={statusColors[show.status]} className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {statusLabels[show.status]}
                </Badge>
                {show.branch && (
                  <Badge variant="outline" className="text-neutral-500 border-neutral-200">
                    {show.branch.name}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-gray-900 leading-tight mb-6">
                {show.title}
              </h1>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-6 border-t border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Thời gian</p>
                    <p className="font-semibold text-gray-900">{formatDateTime(show.performTime)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Địa điểm</p>
                    <p className="font-semibold text-gray-900">{show.stage.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            {show.description && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100">
                <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                  <span className="text-2xl">📝</span> Giới thiệu show
                </h3>
                <div
                  className="prose prose-neutral prose-lg max-w-none text-neutral-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: show.description }}
                />
              </div>
            )}

            {/* Artists Grid */}
            {show.artists.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-xl px-2 flex items-center gap-2">
                  <span className="text-2xl">🎤</span> Nghệ sĩ biểu diễn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {show.artists.map((artist) => (
                    <div
                      key={artist.id}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-neutral-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 border-2 border-white shadow-md">
                        {/* Placeholder or artist image if available */}
                        <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-500 font-bold text-xl">
                          {artist.name.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-brand-600 transition-colors">
                          {artist.name}
                          {artist.isHeadline && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700">
                              ★ HEADLINE
                            </span>
                          )}
                        </h4>
                        {artist.bio && (
                          <p className="text-sm text-neutral-500 line-clamp-1">{artist.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venue Info Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-neutral-100">
               <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                  <span className="text-2xl">📍</span> Thông tin địa điểm
                </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{show.stage.name}</h4>
                  <p className="text-neutral-600">{show.stage.address}</p>
                  <p className="text-sm text-neutral-500 mt-1">{show.stage.location.name}</p>
                </div>

                {/* Google Maps Integration */}
                {(show.stage.latitude && show.stage.longitude) ? (
                  <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-inner">
                    <LocationMap
                      latitude={show.stage.latitude}
                      longitude={show.stage.longitude}
                      title={show.stage.name}
                      address={show.stage.address || undefined}
                      height="300px"
                    />
                  </div>
                ) : show.stage.mapLink ? (
                  <a
                    href={show.stage.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-brand-50 text-brand-700 font-bold hover:bg-brand-100 transition-colors"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Xem bản đồ trên Google Maps
                  </a>
                ) : null}

                {/* Directions Link */}
                {show.stage.latitude && show.stage.longitude && (
                  <div className="pt-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${show.stage.latitude},${show.stage.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      <Navigation className="h-4 w-4" />
                      Chỉ đường đến địa điểm
                    </a>
                  </div>
                )}

                {show.checkInTime && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100 mt-4">
                    <Clock className="h-5 w-5 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-600">Mở cửa check-in: <span className="text-gray-900 font-bold">{formatDateTime(show.checkInTime)}</span></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Sticky */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-brand-500/10 border border-brand-100 overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                
                <div className="relative z-10 text-center space-y-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-gray-900">Đặt vé ngay</h3>
                    <p className="text-neutral-500 text-sm mt-1">Số lượng vé có hạn cho show diễn này</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 text-left p-3 rounded-xl bg-neutral-50">
                      <CheckCircle2 className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-gray-900">Vé không định danh</p>
                        <p className="text-xs text-neutral-500">Dễ dàng tặng hoặc nhượng lại</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-left p-3 rounded-xl bg-neutral-50">
                      <CheckCircle2 className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-gray-900">Check-in QR Code</p>
                        <p className="text-xs text-neutral-500">Quét mã vào cửa nhanh chóng</p>
                      </div>
                    </div>
                  </div>

                  <Link href="/tickets" prefetch={false} className="block">
                    <Button className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-brand-500/20 btn-neon">
                      <Ticket className="mr-2 h-5 w-5" />
                      MUA VÉ NGAY
                    </Button>
                  </Link>
                  
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                    Thanh toán an toàn • Hỗ trợ 24/7
                  </p>
                </div>
              </div>
              
              {/* Need Help? */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 text-center">
                 <p className="font-bold text-gray-900 mb-2">Bạn cần hỗ trợ?</p>
                 <p className="text-sm text-neutral-500 mb-4">Liên hệ với chúng tôi để được tư vấn thêm về show diễn</p>
                 <a href="tel:0912946549" className="text-brand-600 font-bold text-lg hover:underline">
                   0912 946 549
                 </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
