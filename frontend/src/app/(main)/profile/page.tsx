'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState, memo, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Ticket,
  Wallet,
  Edit2,
  Shield,
  ChevronRight,
  Clock,
  Package,
  CreditCard,
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { useAuthStore } from '@/stores/auth.store';
import { get, patch } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { singerService } from '@/services/singer.service';
import { ImageUpload } from '@/components/common/ImageUpload';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { Link } from '@/components/common/Link';
import { usePageTitle } from '@/hooks/usePageTitle';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

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

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-sky-100 text-sky-700 border-sky-200', icon: CheckCircle },
  MANUAL_REVIEW: { label: 'Chờ duyệt', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: AlertCircle },
} as const;

const PAYMENT_STATUS_CONFIG = {
  PAID: { label: 'Đã thanh toán', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  UNPAID: { label: 'Chưa thanh toán', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'text-sky-600 bg-sky-50 border-sky-200' },
} as const;

// ============================================================================
// COMPONENTS
// ============================================================================

const ProfileSkeleton = memo(function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-48 bg-slate-200 w-full animate-pulse" />
      <div className="px-4 md:px-8 -mt-12">
         <div className="h-24 w-24 rounded-full bg-slate-300 animate-pulse border-4 border-white" />
         <div className="mt-4 space-y-2">
            <div className="h-8 w-48 bg-slate-300 rounded animate-pulse" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
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
  const paymentConfig = PAYMENT_STATUS_CONFIG[booking.paymentStatus as keyof typeof PAYMENT_STATUS_CONFIG];
  const StatusIcon = statusConfig?.icon || Clock;
  const totalItems = booking.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link href={`/checkout?code=${booking.bookingCode}`} className="block">
      <div className="group bg-white rounded-lg border border-slate-200 hover:border-brand-300 hover:shadow-sm transition-all duration-200 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                  #{booking.bookingCode}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${statusConfig?.color || 'bg-slate-100 text-slate-600'}`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig?.label || booking.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                 <span className="flex items-center gap-1.5">
                    <History className="h-4 w-4" />
                    {formatDate(booking.createdAt)}
                 </span>
                 <span className="hidden sm:inline w-1 h-1 bg-slate-300 rounded-full" />
                 <span className="flex items-center gap-1.5">
                    <Package className="h-4 w-4" />
                    {totalItems} sản phẩm
                 </span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
               <div className="text-right">
                  <p className="text-sm text-slate-500 mb-0.5">Tổng tiền</p>
                  <p className="text-lg font-bold text-brand-600">{formatCurrency(booking.finalAmount)}</p>
               </div>
               <span className={`text-xs px-2 py-0.5 rounded border ${paymentConfig?.color} font-medium`}>
                  {paymentConfig?.label || booking.paymentStatus}
               </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProfilePage() {
  usePageTitle();
  const router = useRouter();
  const { isAuthenticated, user: authUser, setUser, logout } = useAuthStore();
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
    staleTime: 5 * 60 * 1000,
  });

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => get<WalletInfo>('/users/me/wallet'),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const { data: bookings } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => get<{ items: Booking[] }>('/users/me/bookings'),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  const { data: singerRegistrations } = useQuery({
    queryKey: ['my-singer-registrations'],
    queryFn: singerService.getMyRegistrations,
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
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
    if (!bookings?.items) return { total: 0, completed: 0, pending: 0 };
    return {
      total: bookings.items.length,
      completed: bookings.items.filter((b) => b.status === 'COMPLETED' || b.paymentStatus === 'PAID').length,
      pending: bookings.items.filter((b) => b.status === 'PENDING').length,
    };
  }, [bookings]);

  if (!isAuthenticated) return null;
  if (profileLoading) return <ProfileSkeleton />;

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'STAFF';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Profile Section */}
      <div className="relative bg-white border-b border-slate-200">
        <div className="h-32 sm:h-40 bg-gradient-to-r from-brand-500 to-brand-600 w-full object-cover relative overflow-hidden">
             <div className="absolute inset-0 bg-black/10" />
             <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="px-4 md:px-8 pb-6">
           <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-14 relative z-10">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                    {profile?.avatarUrl ? (
                        <img
                          src={getCloudinaryUrl(profile.avatarUrl, 'avatar')}
                          alt={profile.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <User className="h-10 w-10 text-slate-400" />
                        </div>
                      )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0 pb-1">
                 <h1 className="text-2xl font-bold text-slate-900 truncate">{profile?.fullName}</h1>
                 <div className="flex items-center gap-2 mt-1 text-slate-600 text-sm">
                    <span className="flex items-center gap-1">
                       <User className="h-3.5 w-3.5" />
                       {profile?.role === 'ADMIN' ? 'Quản trị viên' : profile?.role === 'STAFF' ? 'Nhân viên' : 'Khách hàng'}
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
                 className="hidden sm:flex self-center sm:self-end mb-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
               >
                 <LogOut className="h-4 w-4 mr-2" />
                 Đăng xuất
               </Button>
           </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        {/* Sticky Tab Navigation */}
        <div className="sticky top-16 z-20 bg-white border-b border-slate-200 shadow-sm">
           <div className="px-4 md:px-8 overflow-x-auto scrollbar-none">
              <TabsList className="h-auto w-full justify-start gap-6 bg-transparent p-0">
                 <TabsTrigger 
                    value="overview" 
                    className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-600 data-[state=active]:shadow-none text-slate-500 font-medium hover:text-slate-800 transition-colors gap-2"
                 >
                    <LayoutDashboard className="h-4 w-4" />
                    Tổng quan
                 </TabsTrigger>
                 <TabsTrigger 
                    value="bookings" 
                    className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-600 data-[state=active]:shadow-none text-slate-500 font-medium hover:text-slate-800 transition-colors gap-2"
                 >
                    <History className="h-4 w-4" />
                    Lịch sử đơn hàng
                 </TabsTrigger>
                 {/* Wallet Tab - Commented out */}
                 {/* <TabsTrigger 
                    value="wallet" 
                    className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-600 data-[state=active]:shadow-none text-slate-500 font-medium hover:text-slate-800 transition-colors gap-2"
                 >
                    <Wallet className="h-4 w-4" />
                    Ví của tôi
                 </TabsTrigger> */}
                 <TabsTrigger 
                    value="singer-registrations" 
                    className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-600 data-[state=active]:shadow-none text-slate-500 font-medium hover:text-slate-800 transition-colors gap-2"
                 >
                    <Mic className="h-4 w-4" />
                    Đăng ký ca sĩ
                 </TabsTrigger>
                 <TabsTrigger 
                    value="settings" 
                    className="rounded-none border-b-2 border-transparent px-0 py-3 data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-600 data-[state=active]:shadow-none text-slate-500 font-medium hover:text-slate-800 transition-colors gap-2"
                 >
                    <Settings className="h-4 w-4" />
                    Cài đặt
                 </TabsTrigger>
              </TabsList>
           </div>
        </div>

        {/* Tab Content Area */}
        <div className="px-4 md:px-8 py-6 md:py-8 w-full max-w-[1920px] mx-auto min-h-[500px]">
           <TabsContent value="overview" className="space-y-6 mt-0">
              {/* Wallet Banner - Commented out */}
              {/* <div className="rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-400 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden group">
                 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                       <p className="text-emerald-50 font-medium mb-2 flex items-center gap-2 text-sm uppercase tracking-wider opacity-90">
                          <Wallet className="h-4 w-4" />
                          Số dư ví hiện tại
                       </p>
                       <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm">
                          {wallet ? formatCurrency(wallet.balance) : '0 ₫'}
                       </h2>
                    </div>
                    <div className="flex gap-3">
                         <div className={`px-4 py-2 rounded-full backdrop-blur-xl bg-white/15 border border-white/20 flex items-center gap-2 ${wallet?.status === 'ACTIVE' ? '' : 'text-red-100'}`}>
                           <div className={`w-2.5 h-2.5 rounded-full ${wallet?.status === 'ACTIVE' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-red-400'}`} />
                           <span className="font-medium text-sm">
                             {wallet?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã bị khóa'}
                           </span>
                         </div>
                    </div>
                 </div>
                 
                 <div className="absolute -top-1/2 -right-1/2 w-[500px] h-[500px] bg-gradient-to-b from-white/20 to-transparent rounded-full blur-3xl mix-blend-overlay opacity-50" />
                 <div className="absolute -bottom-1/2 -left-1/2 w-[500px] h-[500px] bg-gradient-to-t from-emerald-900/40 to-transparent rounded-full blur-3xl opacity-50" />
              </div> */}

               {/* Stats Grid */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                     <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Tổng đơn hàng</div>
                     <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                     <div className="text-emerald-600 text-xs font-medium uppercase tracking-wider mb-1">Đã hoàn thành</div>
                     <div className="text-2xl font-bold text-emerald-700">{stats.completed}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                     <div className="text-amber-600 text-xs font-medium uppercase tracking-wider mb-1">Đang xử lý</div>
                     <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
                  </div>
                  {isAdmin && (
                    <Link href="/admin/dashboard" className="block h-full">
                       <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-4 rounded-xl text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col justify-center">
                          <div className="flex items-center gap-2 font-medium mb-1">
                             <Shield className="h-4 w-4" />
                             Quản trị
                          </div>
                          <div className="text-sm opacity-90">Truy cập Dashboard &rarr;</div>
                       </div>
                    </Link>
                  )}
               </div>

               {/* Recent Bookings Preview */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold text-slate-900">Đơn hàng gần đây</h3>
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                        asChild
                     >
                        {/* Use tab switch logic if needed - for now just a link/switch */}
                        <div className="cursor-pointer">Xem tất cả</div>
                     </Button>
                  </div>
                  
                  {!bookings?.items || bookings.items.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-300">
                      <Ticket className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 mb-4">Bạn chưa có đơn hàng nào</p>
                      <Link href="/shows">
                        <Button>Khám phá sự kiện</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                       {bookings.items.slice(0, 3).map((booking) => (
                          <BookingCard key={booking.id} booking={booking} />
                       ))}
                    </div>
                  )}
               </div>
           </TabsContent>

           <TabsContent value="bookings" className="mt-0">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Tất cả đơn hàng</h2>
                  <Badge variant="outline" className="px-3 py-1 text-slate-600">
                    Tổng: {stats.total}
                  </Badge>
               </div>

               {!bookings?.items || bookings.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center shadow-sm mb-4">
                       <ShoppingBag className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Chưa có lịch sử mua hàng</h3>
                    <p className="text-slate-500 max-w-sm text-center mt-2 mb-6">
                      Bạn chưa thực hiện giao dịch nào. Hãy khám phá các sự kiện hấp dẫn ngay!
                    </p>
                    <Link href="/shows">
                       <Button size="lg" className="bg-brand-600 hover:bg-brand-700">Mua vé ngay</Button>
                    </Link>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                     {bookings.items.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                     ))}
                  </div>
               )}
           </TabsContent>

           <TabsContent value="singer-registrations" className="mt-0">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Đăng ký ca sĩ</h2>
                  <Badge variant="outline" className="px-3 py-1 text-slate-600">
                    Tổng: {singerRegistrations?.length || 0}
                  </Badge>
               </div>

               {!singerRegistrations || singerRegistrations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center shadow-sm mb-4">
                       <Mic className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Chưa có đăng ký ca sĩ</h3>
                    <p className="text-slate-500 max-w-sm text-center mt-2 mb-6">
                      Bạn chưa đăng ký tham gia chương trình ca sĩ nào. Hãy khám phá và đăng ký ngay!
                    </p>
                    <Link href="/register-singer">
                       <Button size="lg" className="bg-brand-600 hover:bg-brand-700">Đăng ký ngay</Button>
                    </Link>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {singerRegistrations.map((registration) => (
                        <Card key={registration.id} className="border border-slate-200">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-sm font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                    #{registration.id.slice(-8)}
                                  </span>
                                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${
                                    registration.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                    registration.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                    registration.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}>
                                    {registration.status === 'PENDING' && <Clock className="h-3 w-3" />}
                                    {registration.status === 'APPROVED' && <CheckCircle className="h-3 w-3" />}
                                    {registration.status === 'REJECTED' && <XCircle className="h-3 w-3" />}
                                    {registration.status === 'PENDING' ? 'Chờ duyệt' :
                                     registration.status === 'APPROVED' ? 'Đã duyệt' :
                                     registration.status === 'REJECTED' ? 'Từ chối' : registration.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                   <span className="flex items-center gap-1.5">
                                      <History className="h-4 w-4" />
                                      {formatDate(registration.createdAt)}
                                   </span>
                                   <span className="hidden sm:inline w-1 h-1 bg-slate-300 rounded-full" />
                                   <span className="flex items-center gap-1.5">
                                      <Package className="h-4 w-4" />
                                      {registration.package || 'Gói tùy chỉnh'}
                                   </span>
                                </div>
                                <div className="text-sm">
                                  <p><strong>Tên:</strong> {registration.fullName}</p>
                                  <p><strong>Email:</strong> {registration.email}</p>
                                  <p><strong>SĐT:</strong> {registration.phoneNumber}</p>
                                  {registration.favoriteGenre && (
                                    <p><strong>Thể loại yêu thích:</strong> {registration.favoriteGenre}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            {registration.adminNotes && (
                              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-600">
                                  <strong>Ghi chú từ admin:</strong> {registration.adminNotes}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                     ))}
                  </div>
               )}
           </TabsContent>
           
           {/* Wallet Tab Content - Commented out */}
           {/* <TabsContent value="wallet" className="mt-0 space-y-6">
                <div className="max-w-3xl">
                   <h2 className="text-xl font-bold text-slate-900 mb-6">Thông tin ví</h2>
                   <Card className="border shadow-sm border-slate-200">
                     <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-8">
                             <div className="flex-1 space-y-6">
                                <div>
                                   <Label className="text-slate-500 text-xs uppercase tracking-wider">Số dư</Label>
                                   <div className="text-3xl font-bold text-slate-900 mt-1">{wallet ? formatCurrency(wallet.balance) : '0 ₫'}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                   <div>
                                     <Label className="text-slate-500 text-xs uppercase tracking-wider">Trạng thái</Label>
                                     <div className={`mt-1 font-medium ${wallet?.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {wallet?.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                                     </div>
                                   </div>
                                   <div>
                                     <Label className="text-slate-500 text-xs uppercase tracking-wider">Tiền tệ</Label>
                                     <div className="mt-1 font-medium text-slate-900">VND</div>
                                   </div>
                                </div>
                             </div>
                             <div className="w-full md:w-auto flex flex-col justify-center items-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                                 <CreditCard className="h-10 w-10 text-slate-400 mb-3" />
                                 <p className="text-sm text-slate-500 mb-4">Nạp tiền vào ví để thanh toán nhanh hơn</p>
                                 <Button variant="outline" className="w-full" disabled>Tính năng đang phát triển</Button>
                             </div>
                        </div>
                     </CardContent>
                   </Card>
                </div>
           </TabsContent> */}

           <TabsContent value="settings" className="mt-0">
               <div className="max-w-2xl">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-xl font-bold text-slate-900">Cài đặt tài khoản</h2>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                     {/* Avatar Section */}
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
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
                                  className="w-24 h-24 rounded-full border-2 border-slate-200 shadow-sm"
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

                     {/* Personal Info */}
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
                           <User className="h-4 w-4 text-brand-500" />
                           Thông tin cá nhân
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label htmlFor="fullName">Họ và tên</Label>
                              <Input 
                                id="fullName" 
                                {...register('fullName')} 
                                className="h-11 border-slate-200 focus:border-brand-500"
                                placeholder="Nhập họ tên của bạn"
                              />
                              {errors.fullName && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
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
                                <p className="text-xs text-red-500 flex items-center gap-1">
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
                           className="bg-brand-600 hover:bg-brand-700 min-w-[120px]"
                           disabled={isUpdating}
                        >
                           {isUpdating ? (
                             <>
                               <span className="animate-spin mr-2">⏳</span>
                               Đang lưu...
                             </>
                           ) : (
                             <>
                               <Save className="h-4 w-4 mr-2" />
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
      
      {/* Mobile Logout (Sticky Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 safe-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-100 hover:bg-red-50 h-11"
            onClick={handleLogout}
         >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
         </Button>
      </div>
    </div>
  );
}
