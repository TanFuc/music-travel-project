'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Ticket, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { toast } from 'sonner';
import { useState } from 'react';

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
  properties: Record<string, unknown> | null;
  metaTitle: string | null;
  metaDescription: string | null;
  stage: {
    id: number;
    name: string;
    address: string | null;
    mapLink: string | null;
    location: {
      id: number;
      name: string;
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
  const slug = params.slug as string;
  const addTicket = useCartStore((state) => state.addTicket);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const { data: show, isLoading, error } = useQuery({
    queryKey: ['show', slug],
    queryFn: () => get<ShowDetail>(`/shows/${slug}`),
    enabled: !!slug,
  });

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
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/shows" className="inline-flex items-center text-neutral-600 hover:text-brand-500 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại danh sách
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 text-white p-8 md:p-12">
            <div className="relative z-10">
              <Badge variant={statusColors[show.status]} className="mb-4">
                {statusLabels[show.status]}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{show.title}</h1>
              <div className="flex flex-wrap gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDateTime(show.performTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{show.stage.name}</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">{show.stage.name}</h4>
                <p className="text-neutral-600">{show.stage.address}</p>
                <p className="text-sm text-neutral-500">{show.stage.location.name}</p>
              </div>
              {show.stage.mapLink && (
                <a
                  href={show.stage.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-brand-500 hover:text-brand-600"
                >
                  Xem bản đồ
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              )}
              {show.checkInTime && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Clock className="h-4 w-4" />
                  <span>Mở cửa check-in: {formatDateTime(show.checkInTime)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Selection Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Chọn vé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isBookable ? (
                <div className="text-center py-4">
                  <p className="text-neutral-500">Sự kiện này không còn mở bán vé.</p>
                </div>
              ) : show.ticketClasses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-neutral-500">Chưa có thông tin vé.</p>
                </div>
              ) : (
                <>
                  {show.ticketClasses.map((ticketClass) => (
                    <div
                      key={ticketClass.id}
                      className="border rounded-lg p-4 space-y-3"
                      style={{
                        borderLeftColor: ticketClass.colorCode || '#22C55E',
                        borderLeftWidth: '4px',
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{ticketClass.name || 'Vé chung'}</h4>
                          <p className="text-sm text-neutral-500">
                            Còn {ticketClass.availableCount} vé
                          </p>
                        </div>
                        <span className="text-lg font-bold text-brand-600">
                          {formatCurrency(ticketClass.price)}
                        </span>
                      </div>
                      <Button
                        className="w-full"
                        disabled={ticketClass.availableCount === 0 || selectedClass === ticketClass.id}
                        onClick={() => handleAddToCart(ticketClass)}
                      >
                        {ticketClass.availableCount === 0
                          ? 'Hết vé'
                          : selectedClass === ticketClass.id
                            ? 'Đã thêm!'
                            : 'Thêm vào giỏ'}
                      </Button>
                    </div>
                  ))}

                  <div className="border-t pt-4">
                    <Link href="/cart">
                      <Button variant="outline" className="w-full">
                        Xem giỏ hàng
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
