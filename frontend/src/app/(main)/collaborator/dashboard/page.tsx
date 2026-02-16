'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { CheckCircle, Clock, Wallet, Ticket, Plus, Tag, Copy, Calendar as LucideCalendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth.store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CommissionDetail {
  orderId: number;
  orderCode: string;
  orderDate: string;
  customerName: string;
  ticketQty: number;
  totalCommission: number;
  discountGiven: number;
  netEarnings: number;
  paymentStatus: string;
  commissionStatus: 'LOCKED' | 'AVAILABLE';
}

interface CommissionSummary {
  totalEarnings: number;
  pendingCommissions: number;
  availableBalance: number;
  totalOrders: number;
  totalTicketsSold: number;
}

interface Voucher {
  id: number;
  code: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export default function CollaboratorDashboard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Queries
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['collaborator-summary'],
    queryFn: () => get<CommissionSummary>('/collaborator/dashboard/summary'),
  });

  const { data: vouchers, isLoading: isLoadingVouchers } = useQuery({
    queryKey: ['collaborator-vouchers'],
    queryFn: () => get<Voucher[]>('/collaborator/vouchers'),
  });

  // Create Voucher Mutation
  const createVoucherMutation = useMutation({
    mutationFn: (data: any) => post('/collaborator/vouchers', data),
    onSuccess: () => {
      toast.success('Tạo voucher thành công!');
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['collaborator-vouchers'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi khi tạo voucher');
    }
  });

  const handleCreateVoucher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      code: formData.get('code') as string,
      discountType: formData.get('discountType') as string,
      discountValue: Number(formData.get('discountValue')),
      minOrderValue: formData.get('minOrderValue') ? Number(formData.get('minOrderValue')) : undefined,
      usageLimit: formData.get('usageLimit') ? Number(formData.get('usageLimit')) : undefined,
      startDate: formData.get('startDate') ? new Date(formData.get('startDate') as string).toISOString() : undefined,
      endDate: formData.get('endDate') ? new Date(formData.get('endDate') as string).toISOString() : undefined,
    };

    createVoucherMutation.mutate(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép vào clipboard');
  };

  return (
    <div className="container mx-auto py-8 space-y-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Cộng Tác Viên</h1>
          <p className="text-neutral-500 mt-1">Quản lý thu nhập và voucher của bạn</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <span className="text-sm text-blue-800 font-medium">Mã giới thiệu của bạn:</span>
          <code className="bg-white px-2 py-1 rounded border border-blue-200 font-mono font-bold text-blue-600">
            {user?.referralCode || 'Updating...'}
          </code>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100" onClick={() => user?.referralCode && copyToClipboard(user.referralCode)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thu nhập</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                {formatCurrency(summary?.totalEarnings || 0)}
              </div>
            )}
            <p className="text-xs text-neutral-500 mt-1">Đã thanh toán vào ví</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoa hồng chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(summary?.pendingCommissions || 0)}
              </div>
            )}
            <p className="text-xs text-neutral-500 mt-1">Đơn hàng chưa thanh toán</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vé đã bán</CardTitle>
            <Ticket className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold text-blue-600">
                {summary?.totalTicketsSold || 0}
              </div>
            )}
            <p className="text-xs text-neutral-500 mt-1">Tổng số vé từ đơn giới thiệu</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow bg-blue-50/50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Số dư khả dụng</CardTitle>
            <Wallet className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(summary?.availableBalance || 0)}
              </div>
            )}
            <Button variant="link" className="px-0 h-auto text-xs text-blue-600 hover:text-blue-800 mt-1">
              Rút tiền ngay &rarr;
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vouchers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vouchers">Quản lý Voucher</TabsTrigger>
          <TabsTrigger value="commissions">Lịch sử hoa hồng</TabsTrigger>
        </TabsList>

        <TabsContent value="vouchers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold tracking-tight">Danh sách mã giảm giá</h2>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Tạo voucher mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Tạo mã giảm giá mới</DialogTitle>
                  <DialogDescription>
                    Tạo mã giảm giá riêng để chia sẻ cho khách hàng của bạn.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateVoucher} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Mã voucher</Label>
                      <Input id="code" name="code" placeholder="VD: TET2025" required pattern="[A-Za-z0-9]+" title="Chỉ chứa chữ và số" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountType">Loại giảm giá</Label>
                      <Select name="discountType" defaultValue="FIXED_AMOUNT">
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIXED_AMOUNT">Số tiền (VND)</SelectItem>
                          <SelectItem value="PERCENT">Phần trăm (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discountValue">Giá trị giảm</Label>
                      <Input id="discountValue" name="discountValue" type="number" min="1000" placeholder="VD: 50000" required />
                      <p className="text-[10px] text-neutral-500">Tối đa 100,000 VND</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minOrderValue">Đơn tối thiểu</Label>
                      <Input id="minOrderValue" name="minOrderValue" type="number" min="0" placeholder="VD: 200000" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="usageLimit">Giới hạn sử dụng</Label>
                      <Input id="usageLimit" name="usageLimit" type="number" min="1" placeholder="Số lượt" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-col gap-2">
                        <Label>Thời hạn (Tuỳ chọn)</Label>
                        <div className="flex gap-2">
                          <Input name="startDate" type="date" className="text-xs" />
                          <span className="self-center">-</span>
                          <Input name="endDate" type="date" className="text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
                    <Button type="submit" disabled={createVoucherMutation.isPending}>
                      {createVoucherMutation.isPending ? 'Đang tạo...' : 'Tạo mã ngay'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingVouchers ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
            ) : vouchers && vouchers.length > 0 ? (
              vouchers.map(voucher => (
                <Card key={voucher.id} className="relative overflow-hidden group hover:border-brand-300 transition-colors">
                  <div className="absolute top-0 right-0 p-2">
                    <Badge variant={voucher.isActive ? 'default' : 'destructive'} className={voucher.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : ''}>
                      {voucher.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-brand-600" />
                      <CardTitle className="font-mono text-xl">{voucher.code}</CardTitle>
                    </div>
                    <CardDescription>
                      Giảm {voucher.discountType === 'PERCENT' ? `${voucher.discountValue}%` : formatCurrency(voucher.discountValue)}
                      {voucher.minOrderValue ? ` cho đơn từ ${formatCurrency(voucher.minOrderValue)}` : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-neutral-600 space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span>Đã sử dụng:</span>
                      <span className="font-medium text-neutral-900">{voucher.usedCount} / {voucher.usageLimit || '∞'}</span>
                    </div>
                    {(voucher.startDate || voucher.endDate) && (
                      <div className="flex items-center gap-2 text-xs pt-1">
                        <LucideCalendar className="h-3.5 w-3.5" />
                        <span>
                          {voucher.startDate ? formatDate(voucher.startDate) : '...'} - {voucher.endDate ? formatDate(voucher.endDate) : '...'}
                        </span>
                      </div>
                    )}
                    <Button variant="secondary" size="sm" className="w-full mt-2 gap-2 group-hover:bg-brand-50 group-hover:text-brand-700" onClick={() => copyToClipboard(voucher.code)}>
                      <Copy className="h-3.5 w-3.5" /> Sao chép mã
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-neutral-50">
                <p className="text-neutral-500 mb-4">Bạn chưa tạo mã giảm giá nào.</p>
                <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Tạo mã đầu tiên</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hoa hồng</CardTitle>
              <CardDescription>Chi tiết các đơn hàng đã giới thiệu thành công.</CardDescription>
            </CardHeader>
            <CardContent>
              <CommissionHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CommissionHistory() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['collaborator-commissions', page],
    queryFn: () => get<{ data: CommissionDetail[], meta: any }>(`/collaborator/dashboard/commissions?page=${page}&limit=10`),
  });

  if (isLoading) {
    return <div className="space-y-2">
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
    </div>;
  }

  if (!data?.data?.length) {
    return <div className="text-center py-8 text-neutral-500">Chưa có dữ liệu hoa hồng.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead className="text-right">SL Vé</TableHead>
              <TableHead className="text-right">Hoa hồng thực nhận</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((item) => (
              <TableRow key={item.orderId}>
                <TableCell className="font-mono">{item.orderCode}</TableCell>
                <TableCell>{formatDate(item.orderDate)}</TableCell>
                <TableCell>{item.customerName}</TableCell>
                <TableCell className="text-right">{item.ticketQty}</TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  {formatCurrency(item.netEarnings)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={item.commissionStatus === 'AVAILABLE' ? 'success' : 'secondary'}>
                    {item.commissionStatus === 'AVAILABLE' ? 'Khả dụng' : 'Chờ duyệt'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data.meta.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Trước</Button>
          <span className="text-sm text-neutral-600">Trang {page} / {data.meta.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === data.meta.totalPages}>Sau</Button>
        </div>
      )}
    </div>
  );
}
