'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, Users, Ticket, QrCode, Clock, Edit } from 'lucide-react';
import { Link } from '@/components/common/Link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { ShowFormModal } from '@/components/admin/ShowFormModal';
interface Show {
  id: number;
  title: string;
  description?: string;
  performTime: string;
  checkInTime?: string;
  status: string;
  seatSelectionEnabled: boolean;
  stage: {
    id: number;
    name: string;
    address: string;
    location: {
      name: string;
    };
  };
  artists: Array<{
    artist: {
      id: number;
      name: string;
      bio?: string;
    };
    isHeadline: boolean;
  }>;
  tickets: Array<{
    id: number;
    ticketClass: {
      name: string;
      price: number;
      colorCode: string;
    };
    status: string;
  }>;
  _count: {
    tickets: number;
  };
  properties?: any;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}
const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  UPCOMING: 'success',
  ONGOING: 'warning',
  ENDED: 'default',
  CANCELLED: 'destructive',
};
const ticketStatusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  AVAILABLE: 'success',
  LOCKED: 'warning',
  SOLD: 'default',
  USED: 'default',
  CANCELLED: 'destructive',
};
export default function ShowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const showId = Number(params.id);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: show, isLoading } = useQuery({
    queryKey: ['admin-show', showId],
    queryFn: () => get<Show>(`/admin/shows/${showId}`),
    enabled: !!showId,
  });
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (!show) {
    return (
      <div className="py-12 text-center">
        <h2 className="mb-2 text-xl font-semibold">Không tìm thấy show diễn</h2>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }
  const ticketsByClass = show.tickets.reduce(
    (acc, ticket) => {
      const className = ticket.ticketClass.name;
      if (!acc[className]) {
        acc[className] = {
          ...ticket.ticketClass,
          total: 0,
          sold: 0,
          available: 0,
        };
      }
      acc[className].total++;
      if (ticket.status === 'SOLD' || ticket.status === 'USED') {
        acc[className].sold++;
      } else if (ticket.status === 'AVAILABLE') {
        acc[className].available++;
      }
      return acc;
    },
    {} as Record<string, any>
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{show.title}</h1>
            <p className="text-neutral-600">ID: {show.id}</p>
          </div>
          <Badge variant={statusColors[show.status]}>{show.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Link href={`/admin/shows/${show.id}/qr-codes`}>
            <Button variant="outline" className="gap-2">
              <QrCode className="h-4 w-4" />
              QR Codes
            </Button>
          </Link>
          <Link href={`/admin/shows/${show.id}/registrations`}>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Đăng ký biểu diễn
            </Button>
          </Link>
        </div>
      </div>

      <ShowFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={show}
        onSuccess={() => setIsEditOpen(false)}
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {show.description && (
            <div>
              <h3 className="mb-1 font-medium">Mô tả</h3>
              <p className="text-neutral-600">{show.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-neutral-500" />
              <div>
                <p className="font-medium">Thời gian biểu diễn</p>
                <p className="text-neutral-600">{formatDate(show.performTime)}</p>
              </div>
            </div>

            {show.checkInTime && (
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-neutral-500" />
                <div>
                  <p className="font-medium">Thời gian check-in</p>
                  <p className="text-neutral-600">{formatDate(show.checkInTime)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-neutral-500" />
              <div>
                <p className="font-medium">Địa điểm</p>
                <p className="text-neutral-600">{show.stage.name}</p>
                <p className="text-sm text-neutral-500">{show.stage.address}</p>
                <p className="text-sm text-neutral-500">{show.stage.location.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Ticket className="mt-0.5 h-5 w-5 text-neutral-500" />
              <div>
                <p className="font-medium">Chế độ chọn ghế</p>
                <p className="text-neutral-600">
                  {show.seatSelectionEnabled ? 'Chọn ghế cụ thể' : 'Vé tự do (GA)'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {show.artists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Nghệ sĩ ({show.artists.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {show.artists.map(({ artist, isHeadline }) => (
                <div
                  key={artist.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{artist.name}</h4>
                      {isHeadline && <Badge className="bg-yellow-500">Headline</Badge>}
                    </div>
                    {artist.bio && <p className="mt-1 text-sm text-neutral-600">{artist.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Vé ({show._count.tickets})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(ticketsByClass).map((ticketClass: any) => (
              <div key={ticketClass.name} className="rounded-lg border p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: ticketClass.colorCode }}
                  />
                  <h4 className="font-medium">{ticketClass.name}</h4>
                </div>
                <p className="mb-3 text-2xl font-bold text-brand-600">
                  {formatCurrency(ticketClass.price)}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Tổng số:</span>
                    <span className="font-medium">{ticketClass.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Đã bán:</span>
                    <span className="font-medium text-red-600">{ticketClass.sold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Còn lại:</span>
                    <span className="font-medium text-green-600">{ticketClass.available}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {show.properties && Object.keys(show.properties).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin bổ sung</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              {show.properties.dresscode && (
                <>
                  <dt className="font-medium">Dress code:</dt>
                  <dd className="text-neutral-600">{show.properties.dresscode}</dd>
                </>
              )}
              {show.properties.hashtag && (
                <>
                  <dt className="font-medium">Hashtag:</dt>
                  <dd className="text-neutral-600">{show.properties.hashtag}</dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {(show.metaTitle || show.metaDescription || show.metaKeywords) && (
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {show.metaTitle && (
              <div>
                <h4 className="mb-1 font-medium">Meta Title</h4>
                <p className="text-neutral-600">{show.metaTitle}</p>
              </div>
            )}
            {show.metaDescription && (
              <div>
                <h4 className="mb-1 font-medium">Meta Description</h4>
                <p className="text-neutral-600">{show.metaDescription}</p>
              </div>
            )}
            {show.metaKeywords && (
              <div>
                <h4 className="mb-1 font-medium">Meta Keywords</h4>
                <p className="text-neutral-600">{show.metaKeywords}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
