'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, memo, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Ticket,
  Shield,
  ChevronRight,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  History,
  Save,
  Mic,
  Copy,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/auth.store';
import { get, patch } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ImageUpload } from '@/components/common/ImageUpload';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { Link } from '@/components/common/Link';
import { usePageTitle } from '@/hooks/usePageTitle';
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
  isCollaborator: boolean;
  referralCode: string | null;
  createdAt: string;
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
const STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ xử lý',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'bg-sky-100 text-sky-700 border-sky-200',
    icon: CheckCircle,
  },
  MANUAL_REVIEW: {
    label: 'Chờ duyệt',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: AlertCircle,
  },
} as const;
const ProfileSkeleton = memo(function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-48 w-full animate-pulse bg-slate-200" />
      <div className="-mt-12 px-4 md:px-8">
        <div className="h-24 w-24 animate-pulse rounded-full border-4 border-white bg-slate-300" />
        <div className="mt-4 space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-300" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
});
interface BookingCardProps {
  booking: Booking;
}
const BookingCard = memo(function BookingCard({ booking }: BookingCardProps) {
  const statusConfig = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG];
  const totalItems = booking.items.reduce((sum, item) => sum + item.quantity, 0);
  const getDisplayStatus = () => {
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
    return (
      statusConfig || {
        label: booking.status,
        color: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: Clock,
      }
    );
  };
  const displayStatus = getDisplayStatus();
  const DisplayStatusIcon = displayStatus.icon;
  const isProcessed = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
  const canContinuePayment =
    booking.paymentStatus === 'UNPAID' &&
    (booking.status === 'PENDING' || booking.status === 'MANUAL_REVIEW');
  return (
    <div className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-200 hover:border-brand-300 hover:shadow-md">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded bg-slate-100 px-2 py-1 font-mono text-sm font-semibold text-slate-900">
                #{booking.bookingCode}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${displayStatus.color}`}
              >
                <DisplayStatusIcon className="h-3 w-3" />
                {displayStatus.label}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <History className="h-4 w-4" />
                {formatDate(booking.createdAt)}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" />
              <span className="flex items-center gap-1.5">
                <Package className="h-4 w-4" />
                {totalItems} sản phẩm
              </span>
            </div>

            {isProcessed && (
              <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="flex items-start gap-2 text-xs text-emerald-700">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    <strong>Hướng dẫn sử dụng vé:</strong> Quý khách vui lòng đến quầy soát vé tại
                    địa điểm đăng ký, xuất trình mã đơn hàng hoặc QR code để check-in.
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:pt-0">
            <div className="text-right">
              <p className="mb-0.5 text-sm text-slate-500">Tổng tiền</p>
              <p className="text-lg font-bold text-brand-600">
                {formatCurrency(booking.finalAmount)}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {canContinuePayment && (
                <Link href={`/checkout?code=${booking.bookingCode}`}>
                  <Button size="sm" className="w-full gap-2 bg-brand-600 hover:bg-brand-700">
                    Tiếp tục thanh toán
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link href={`/profile/bookings/${booking.bookingCode}`}>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  Xem chi tiết
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
export default function ProfilePage() {
  usePageTitle();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, setUser, logout, hasHydrated } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('ALL');
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => get<UserProfile>('/users/me'),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
  const { data: showBookings } = useQuery({
    queryKey: ['my-show-bookings'],
    queryFn: async () => {
      const result = await get<{
        items: Booking[];
      }>('/users/me/bookings/shows');
      return result;
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
  const { data: singerBookings } = useQuery({
    queryKey: ['my-singer-bookings'],
    queryFn: async () => {
      const result = await get<{
        items: Booking[];
      }>('/users/me/bookings/singer-packages');
      return result;
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
  const filterBookings = (bookings: Booking[] | undefined) => {
    if (!bookings) return [];
    return bookings.filter((booking) => {
      let statusMatch = true;
      if (bookingStatusFilter === 'PENDING') {
        statusMatch = booking.status === 'PENDING' || booking.status === 'MANUAL_REVIEW';
      } else if (bookingStatusFilter === 'PROCESSED') {
        statusMatch = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
      } else if (bookingStatusFilter === 'CANCELLED') {
        statusMatch = booking.status === 'CANCELLED';
      }
      const paymentMatch =
        paymentStatusFilter === 'ALL' || booking.paymentStatus === paymentStatusFilter;
      return statusMatch && paymentMatch;
    });
  };
  const filteredShowBookings = filterBookings(showBookings?.items);
  const filteredSingerBookings = filterBookings(singerBookings?.items);
  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hasHydrated, router]);
  useEffect(() => {
    const bookingCode = searchParams?.get('booking');
    const allBookings = [...(showBookings?.items || []), ...(singerBookings?.items || [])];
    if (bookingCode && allBookings.length > 0) {
      setActiveTab('bookings');
      const booking = allBookings.find((b) => b.bookingCode === bookingCode);
      if (booking) {
        toast.success(`Đơn hàng ${bookingCode} đang chờ xác nhận từ admin!`, {
          description: 'Bạn có thể theo dõi trạng thái đơn hàng trong lịch sử đơn hàng.',
          duration: 5000,
        });
        router.replace('/profile', { scroll: false });
      }
    }
  }, [searchParams, showBookings?.items, singerBookings?.items, router]);
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
    } catch {
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
    }
  };
  const handleLogout = () => {
    logout();
    router.push('/');
  };
  const stats = useMemo(() => {
    const allBookings = [...(showBookings?.items || []), ...(singerBookings?.items || [])];
    return {
      total: allBookings.length,
      completed: allBookings.filter((b) => b.status === 'COMPLETED' || b.paymentStatus === 'PAID')
        .length,
      pending: allBookings.filter((b) => b.status === 'PENDING').length,
    };
  }, [showBookings?.items, singerBookings?.items]);
  if (!hasHydrated) {
    return <ProfileSkeleton />;
  }
  if (!isAuthenticated) return null;
  if (profileLoading) return <ProfileSkeleton />;
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'STAFF';
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="relative border-b border-slate-200 bg-white">
        <div className="relative h-32 w-full overflow-hidden bg-gradient-to-r from-brand-500 to-brand-600 object-cover sm:h-40">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -bottom-10 -right-10 h-64 w-64 animate-pulse rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-6 md:px-8">
          <div className="relative z-10 -mt-12 flex flex-col items-start gap-4 sm:-mt-14 sm:flex-row sm:items-end">
            <div className="group relative">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-md sm:h-32 sm:w-32">
                {profile?.avatarUrl ? (
                  <img
                    src={getCloudinaryUrl(profile.avatarUrl, 'avatar')}
                    alt={profile.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100">
                    <User className="h-10 w-10 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <h1 className="truncate text-2xl font-bold text-slate-900">{profile?.fullName}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {profile?.role === 'ADMIN'
                    ? 'Quản trị viên'
                    : profile?.role === 'STAFF'
                      ? 'Nhân viên'
                      : 'Khách hàng'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {profile?.phoneNumber}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="mb-1 hidden self-center border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 sm:flex sm:self-end"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-16 z-20 border-b border-slate-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 md:px-8">
            <TabsList className="h-auto w-full justify-start gap-6 bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="gap-2 rounded-none border-b-2 border-transparent px-0 py-3 font-medium text-slate-500 transition-colors hover:text-slate-800 data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-600 data-[state=active]:shadow-none"
              >
                <LayoutDashboard className="h-4 w-4" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="gap-2 rounded-none border-b-2 border-transparent px-0 py-3 font-medium text-slate-500 transition-colors hover:text-slate-800 data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-600 data-[state=active]:shadow-none"
              >
                <History className="h-4 w-4" />
                Lịch sử đơn hàng
              </TabsTrigger>

              <TabsTrigger
                value="settings"
                className="gap-2 rounded-none border-b-2 border-transparent px-0 py-3 font-medium text-slate-500 transition-colors hover:text-slate-800 data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-600 data-[state=active]:shadow-none"
              >
                <Settings className="h-4 w-4" />
                Cài đặt
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="mx-auto min-h-[500px] w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Tổng đơn hàng
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-600">
                  Đã hoàn thành
                </div>
                <div className="text-2xl font-bold text-emerald-700">{stats.completed}</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-amber-600">
                  Đang xử lý
                </div>
                <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
              </div>
              {isAdmin && (
                <Link href="/admin/dashboard" className="block h-full">
                  <div className="flex h-full cursor-pointer flex-col justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-4 text-white shadow-md transition-shadow hover:shadow-lg">
                    <div className="mb-1 flex items-center gap-2 font-medium">
                      <Shield className="h-4 w-4" />
                      Quản trị
                    </div>
                    <div className="text-sm opacity-90">Truy cập Dashboard &rarr;</div>
                  </div>
                </Link>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex h-full flex-col justify-between rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="mb-1 text-lg font-bold text-blue-900">
                    Chương trình Cộng Tác Viên
                  </h3>
                  <p className="text-sm text-blue-700">
                    {profile?.isCollaborator
                      ? 'Bạn là Cộng tác viên! Chia sẻ và kiếm thu nhập ngay.'
                      : 'Trở thành đối tác và nhận hoa hồng hấp dẫn.'}
                  </p>
                </div>

                <div className="mt-auto flex w-full flex-col gap-3 sm:flex-row">
                  {profile?.referralCode && (
                    <div className="flex w-full flex-1 items-center justify-between gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 sm:w-auto">
                      <span className="text-xs font-medium uppercase text-slate-500">Mã:</span>
                      <code className="font-mono text-sm font-bold text-blue-700">
                        {profile.referralCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-blue-600"
                        onClick={() => {
                          if (profile.referralCode) {
                            navigator.clipboard.writeText(profile.referralCode);
                            toast.success('Đã sao chép mã giới thiệu');
                          }
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                  <Link
                    href={
                      profile?.isCollaborator ? '/collaborator/dashboard' : '/collaborator/register'
                    }
                    className={profile?.referralCode ? 'w-auto' : 'w-full'}
                  >
                    <Button
                      className={`${profile?.isCollaborator ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'} w-full whitespace-nowrap`}
                    >
                      {profile?.isCollaborator ? (
                        <>
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard CTV
                        </>
                      ) : (
                        <>
                          <Users className="mr-2 h-4 w-4" /> Đăng ký CTV
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex h-full flex-col justify-between rounded-xl border border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="mb-1 text-lg font-bold text-pink-900">Đăng Ký Làm Ca Sĩ</h3>
                  <p className="text-sm text-pink-700">
                    Thỏa sức đam mê ca hát và biểu diễn tại các sự kiện lớn.
                  </p>
                </div>

                <div className="mt-auto flex w-full flex-col">
                  <Link href="/register-singer" className="w-full">
                    <Button className="w-full bg-pink-600 hover:bg-pink-700">
                      <Mic className="mr-2 h-4 w-4" /> Đăng ký ngay
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Đơn hàng gần đây</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand-600 hover:bg-brand-50 hover:text-brand-700"
                  asChild
                >
                  <div className="cursor-pointer">Xem tất cả</div>
                </Button>
              </div>

              {(() => {
                const allBookings = [
                  ...(showBookings?.items || []),
                  ...(singerBookings?.items || []),
                ];
                return !allBookings || allBookings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <Ticket className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="mb-4 text-slate-500">Bạn chưa có đơn hàng nào</p>
                    <Link href="/shows">
                      <Button>Khám phá sự kiện</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allBookings.slice(0, 3).map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                );
              })()}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="mt-0">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Lịch sử đơn hàng</h2>
            </div>

            <Tabs defaultValue="shows" className="w-full">
              <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="shows" className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Vé xem shows
                  <Badge variant="secondary" className="ml-1">
                    {showBookings?.items?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="singer" className="gap-2">
                  <Mic className="h-4 w-4" />
                  Vé đăng ký hát
                  <Badge variant="secondary" className="ml-1">
                    {singerBookings?.items?.length || 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <div className="mb-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Trạng thái đơn hàng:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={bookingStatusFilter === 'ALL' ? 'default' : 'outline'}
                      onClick={() => setBookingStatusFilter('ALL')}
                      className={
                        bookingStatusFilter === 'ALL' ? 'bg-brand-600 hover:bg-brand-700' : ''
                      }
                    >
                      Tất cả
                    </Button>
                    <Button
                      size="sm"
                      variant={bookingStatusFilter === 'PENDING' ? 'default' : 'outline'}
                      onClick={() => setBookingStatusFilter('PENDING')}
                      className={
                        bookingStatusFilter === 'PENDING' ? 'bg-blue-600 hover:bg-blue-700' : ''
                      }
                    >
                      Chờ xử lý
                    </Button>
                    <Button
                      size="sm"
                      variant={bookingStatusFilter === 'PROCESSED' ? 'default' : 'outline'}
                      onClick={() => setBookingStatusFilter('PROCESSED')}
                      className={
                        bookingStatusFilter === 'PROCESSED'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : ''
                      }
                    >
                      Đã xử lý
                    </Button>
                    <Button
                      size="sm"
                      variant={bookingStatusFilter === 'CANCELLED' ? 'default' : 'outline'}
                      onClick={() => setBookingStatusFilter('CANCELLED')}
                      className={
                        bookingStatusFilter === 'CANCELLED' ? 'bg-red-600 hover:bg-red-700' : ''
                      }
                    >
                      Đã hủy
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Trạng thái thanh toán:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={paymentStatusFilter === 'ALL' ? 'default' : 'outline'}
                      onClick={() => setPaymentStatusFilter('ALL')}
                      className={
                        paymentStatusFilter === 'ALL' ? 'bg-brand-600 hover:bg-brand-700' : ''
                      }
                    >
                      Tất cả
                    </Button>
                    <Button
                      size="sm"
                      variant={paymentStatusFilter === 'UNPAID' ? 'default' : 'outline'}
                      onClick={() => setPaymentStatusFilter('UNPAID')}
                      className={
                        paymentStatusFilter === 'UNPAID' ? 'bg-amber-600 hover:bg-amber-700' : ''
                      }
                    >
                      Chưa thanh toán
                    </Button>
                    <Button
                      size="sm"
                      variant={paymentStatusFilter === 'PAID' ? 'default' : 'outline'}
                      onClick={() => setPaymentStatusFilter('PAID')}
                      className={
                        paymentStatusFilter === 'PAID' ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                      }
                    >
                      Đã thanh toán
                    </Button>
                  </div>
                </div>
              </div>

              <TabsContent value="shows" className="mt-0">
                {!showBookings?.items || showBookings.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 shadow-sm">
                      <ShoppingBag className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Chưa có vé xem shows</h3>
                    <p className="mb-6 mt-2 max-w-sm text-center text-slate-500">
                      Bạn chưa mua vé xem shows hoặc tour nào. Hãy khám phá các sự kiện hấp dẫn
                      ngay!
                    </p>
                    <Link href="/shows">
                      <Button size="lg" className="bg-brand-600 hover:bg-brand-700">
                        Mua vé ngay
                      </Button>
                    </Link>
                  </div>
                ) : filteredShowBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 shadow-sm">
                      <ShoppingBag className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Không tìm thấy đơn hàng
                    </h3>
                    <p className="mb-6 mt-2 max-w-sm text-center text-slate-500">
                      Không có đơn hàng nào phù hợp với bộ lọc đã chọn.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      Hiển thị {filteredShowBookings.length} / {showBookings.items.length} đơn hàng
                    </p>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {filteredShowBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="singer" className="mt-0">
                {!singerBookings?.items || singerBookings.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 shadow-sm">
                      <Mic className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Chưa có vé đăng ký hát</h3>
                    <p className="mb-6 mt-2 max-w-sm text-center text-slate-500">
                      Bạn chưa mua gói đăng ký hát nào. Hãy đăng ký để trở thành ca sĩ ngay!
                    </p>
                    <Link href="/register-singer">
                      <Button size="lg" className="bg-brand-600 hover:bg-brand-700">
                        Đăng ký ngay
                      </Button>
                    </Link>
                  </div>
                ) : filteredSingerBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 shadow-sm">
                      <Mic className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Không tìm thấy đơn hàng
                    </h3>
                    <p className="mb-6 mt-2 max-w-sm text-center text-slate-500">
                      Không có đơn hàng nào phù hợp với bộ lọc đã chọn.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      Hiển thị {filteredSingerBookings.length} / {singerBookings.items.length} đơn
                      hàng
                    </p>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                      {filteredSingerBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Cài đặt tài khoản</h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Camera className="h-4 w-4 text-brand-500" />
                    Ảnh đại diện
                  </h3>
                  <div className="flex items-center gap-6">
                    <Controller
                      name="avatarUrl"
                      control={control}
                      render={({ field }) => (
                        <ImageUpload
                          value={field.value || undefined}
                          onChange={field.onChange}
                          folder="avatars"
                          aspectRatio="square"
                          className="h-24 w-24 rounded-full border-2 border-slate-200 shadow-sm"
                          isCompact={true}
                        />
                      )}
                    />
                    <div className="text-sm text-slate-500">
                      <p>Hỗ trợ định dạng: JPG, PNG, GIF</p>
                      <p>Kích thước tối đa: 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                    <User className="h-4 w-4 text-brand-500" />
                    Thông tin cá nhân
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input
                        id="fullName"
                        {...register('fullName')}
                        className="h-11 border-slate-200 focus:border-brand-500"
                        placeholder="Nhập họ tên của bạn"
                      />
                      {errors.fullName && (
                        <p className="flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        {...register('email')}
                        className="h-11 border-slate-200 focus:border-brand-500"
                        placeholder="example@email.com"
                      />
                      {errors.email && (
                        <p className="flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 opacity-60">
                      <Label>Số điện thoại</Label>
                      <Input
                        value={profile?.phoneNumber || ''}
                        disabled
                        className="h-11 bg-slate-50"
                      />
                      <p className="text-xs text-slate-400">Số điện thoại không thể thay đổi</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => reset()}
                    disabled={isUpdating}
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    className="min-w-[120px] bg-brand-600 hover:bg-brand-700"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <span className="mr-2 animate-spin">⏳</span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="safe-pb fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden">
        <Button
          variant="outline"
          className="h-11 w-full border-red-100 text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
