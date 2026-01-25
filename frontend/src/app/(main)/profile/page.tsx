'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, Phone, Mail, Calendar, Ticket, MapPin, Wallet, Edit2, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { useAuthStore } from '@/stores/auth.store';
import { get, patch } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ImageUpload } from '@/components/common/ImageUpload';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { Link } from '@/components/common/Link';

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không đúng định dạng').optional().or(z.literal('')),
  avatarUrl: z.string().optional().nullable(),
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

interface UserProfile {
  id: number;
  phoneNumber: string;
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

interface WalletInfo {
  balance: number;
  currency: string;
  status: string;
}

interface Booking {
  id: number;
  bookingCode: string;
  totalAmount: number;
  finalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    itemType: string;
    quantity: number;
  }>;
}

const bookingStatusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'destructive',
  COMPLETED: 'secondary',
};

const bookingStatusLabels: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn thành',
};

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user: authUser, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => get<UserProfile>('/users/me'),
    enabled: isAuthenticated,
  });

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => get<WalletInfo>('/users/me/wallet'),
    enabled: isAuthenticated,
  });

  const { data: bookings } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => get<{ items: Booking[] }>('/users/me/bookings'),
    enabled: isAuthenticated,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: profile?.fullName || '',
      email: profile?.email || '',
      avatarUrl: profile?.avatarUrl || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        email: profile.email || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: UpdateProfileForm) => {
    setIsUpdating(true);
    try {
      const updated = await patch<UserProfile>('/users/me', data);
      setUser({
        id: updated.id,
        phoneNumber: updated.phoneNumber,
        fullName: updated.fullName,
        email: updated.email,
        role: updated.role,
      });
      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch {
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Tài khoản của tôi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile & Wallet */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin cá nhân
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex flex-col items-center gap-4 mb-4">
                    <Label>Ảnh đại diện</Label>
                    <Controller
                      name="avatarUrl"
                      control={control}
                      render={({ field }) => (
                        <ImageUpload
                          value={field.value || undefined}
                          onChange={field.onChange}
                          folder="avatars"
                          aspectRatio="square"
                          className="w-32 h-32"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input id="fullName" {...register('fullName')} />
                    {errors.fullName && (
                      <p className="text-sm text-red-500">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border">
                    {profile?.avatarUrl ? (
                      <img 
                        src={getCloudinaryUrl(profile.avatarUrl, 'avatar')} 
                        alt={profile.fullName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-100 flex items-center justify-center">
                        <User className="h-10 w-10 text-brand-600" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{profile?.fullName}</h3>
                    <p className="text-sm text-neutral-500">{profile?.role}</p>
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-neutral-400" />
                      <span>{profile?.phoneNumber}</span>
                    </div>
                    {profile?.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      <span>Tham gia từ {formatDate(profile?.createdAt || '')}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wallet Card */}
          <Card className="bg-gradient-to-br from-brand-500 to-brand-600 text-white border-none shadow-brand-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wallet className="h-5 w-5" />
                Ví của tôi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {wallet ? formatCurrency(wallet.balance) : '0 VND'}
              </div>
              <p className="text-white/80 text-sm">
                Trạng thái: {wallet?.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
              </p>
            </CardContent>
          </Card>

          {/* Admin Access Card */}
          {(profile?.role === 'ADMIN' || profile?.role === 'STAFF') && (
            <Link href="/admin/dashboard">
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-shadow cursor-pointer border-none shadow-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Quản trị hệ thống</h3>
                      <p className="text-white/80 text-sm">Truy cập trang quản lý</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        {/* Right Column - Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Lịch sử đặt vé
              </CardTitle>
              <CardDescription>Các đơn hàng của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              {!bookings?.items || bookings.items.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Bạn chưa có đơn hàng nào.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.items.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold">
                            #{booking.bookingCode}
                          </span>
                          <Badge variant={bookingStatusColors[booking.status]}>
                            {bookingStatusLabels[booking.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-600">
                          {booking.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm |{' '}
                          {formatDate(booking.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand-600">
                          {formatCurrency(booking.finalAmount)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {booking.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
