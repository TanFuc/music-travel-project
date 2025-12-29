'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, Phone, Mail, Calendar, Ticket, MapPin, Wallet, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { useAuthStore } from '@/stores/auth.store';
import { get, patch } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Ho ten phai co it nhat 2 ky tu'),
  email: z.string().email('Email khong dung dinh dang').optional().or(z.literal('')),
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
  PENDING: 'Cho xu ly',
  CONFIRMED: 'Da xac nhan',
  CANCELLED: 'Da huy',
  COMPLETED: 'Hoan thanh',
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
    formState: { errors },
    reset,
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: profile?.fullName || '',
      email: profile?.email || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        email: profile.email || '',
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
      toast.success('Cap nhat thong tin thanh cong!');
      setIsEditing(false);
    } catch {
      toast.error('Cap nhat that bai. Vui long thu lai.');
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
      <h1 className="text-3xl font-display font-bold mb-8">Tai khoan cua toi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile & Wallet */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thong tin ca nhan
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ho va ten</label>
                    <Input {...register('fullName')} />
                    {errors.fullName && (
                      <p className="text-sm text-error-500">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" {...register('email')} />
                    {errors.email && (
                      <p className="text-sm text-error-500">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? 'Dang luu...' : 'Luu thay doi'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Huy
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto">
                    <User className="h-10 w-10 text-brand-600" />
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
                      <span>Tham gia tu {formatDate(profile?.createdAt || '')}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wallet Card */}
          <Card className="bg-gradient-to-br from-brand-500 to-brand-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wallet className="h-5 w-5" />
                Vi cua toi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {wallet ? formatCurrency(wallet.balance) : '0 VND'}
              </div>
              <p className="text-white/80 text-sm">
                Trang thai: {wallet?.status === 'ACTIVE' ? 'Hoat dong' : 'Bi khoa'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Lich su dat ve
              </CardTitle>
              <CardDescription>Cac don hang cua ban</CardDescription>
            </CardHeader>
            <CardContent>
              {!bookings?.items || bookings.items.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ban chua co don hang nao.</p>
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
                          {booking.items.reduce((sum, item) => sum + item.quantity, 0)} san pham |{' '}
                          {formatDate(booking.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand-600">
                          {formatCurrency(booking.finalAmount)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {booking.paymentStatus === 'PAID' ? 'Da thanh toan' : 'Chua thanh toan'}
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
