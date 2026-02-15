'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Wallet,
  TrendingUp,
  ShoppingCart,
  Ticket,
  Plus,
  Download,
  Filter,
  ChevronDown,
  HelpCircle,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

import {
  getCommissionSummary,
  getCommissionDetails,
  getMyVouchers,
  createVoucher,
  type CommissionDetail,
  type CollaboratorVoucher,
  type CreateVoucherDto,
} from '@/services/collaborator.service';
import {
  getWalletBalance,
  getMyWithdrawalRequests,
  requestWithdrawal,
  type WithdrawalRequest,
  type WithdrawRequestDto,
} from '@/services/wallet.service';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export default function CollaboratorDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [commissionFilter, setCommissionFilter] = useState<'PAID' | 'UNPAID' | undefined>(undefined);
  const [createVoucherOpen, setCreateVoucherOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['collaborator', 'summary'],
    queryFn: getCommissionSummary,
  });

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: getWalletBalance,
  });

  const { data: commissionsData, isLoading: commissionsLoading } = useQuery({
    queryKey: ['collaborator', 'commissions', commissionFilter],
    queryFn: () => getCommissionDetails({ status: commissionFilter, limit: 20 }),
  });

  const { data: vouchersData, isLoading: vouchersLoading } = useQuery({
    queryKey: ['collaborator', 'vouchers'],
    queryFn: getMyVouchers,
  });

  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['wallet', 'withdrawals'],
    queryFn: () => getMyWithdrawalRequests({ limit: 20 }),
  });

  // Mutations
  const createVoucherMutation = useMutation({
    mutationFn: createVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborator', 'vouchers'] });
      setCreateVoucherOpen(false);
      toast.success('Tạo voucher thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: requestWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      setWithdrawOpen(false);
      toast.success('Yêu cầu rút tiền đã được gửi!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const handleCreateVoucher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dto: CreateVoucherDto = {
      code: formData.get('code') as string,
      discountType: formData.get('discountType') as 'PERCENT' | 'FIXED_AMOUNT',
      discountValue: Number(formData.get('discountValue')),
      maxDiscountAmount: formData.get('maxDiscountAmount')
        ? Number(formData.get('maxDiscountAmount'))
        : undefined,
      usageLimit: formData.get('usageLimit') ? Number(formData.get('usageLimit')) : undefined,
    };
    createVoucherMutation.mutate(dto);
  };

  const handleWithdraw = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dto: WithdrawRequestDto = {
      amount: Number(formData.get('amount')),
      bankName: formData.get('bankName') as string,
      accountNumber: formData.get('accountNumber') as string,
      accountHolder: formData.get('accountHolder') as string,
    };
    withdrawMutation.mutate(dto);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'APPROVED':
      case 'AVAILABLE':
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>;
      case 'UNPAID':
      case 'PENDING':
      case 'LOCKED':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Cộng Tác Viên</h1>
            <p className="text-muted-foreground">Quản lý hoa hồng và voucher của bạn</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Rút tiền
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yêu cầu rút tiền</DialogTitle>
                  <DialogDescription>
                    Số dư khả dụng: {formatCurrency(walletData?.balance || 0)}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleWithdraw}>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="amount">Số tiền (VND)</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        min="50000"
                        max={walletData?.balance || 0}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankName">Tên ngân hàng</Label>
                      <Input id="bankName" name="bankName" placeholder="VD: Vietcombank" required />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Số tài khoản</Label>
                      <Input id="accountNumber" name="accountNumber" required />
                    </div>
                    <div>
                      <Label htmlFor="accountHolder">Chủ tài khoản</Label>
                      <Input id="accountHolder" name="accountHolder" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={withdrawMutation.isPending}>
                      {withdrawMutation.isPending ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={createVoucherOpen} onOpenChange={setCreateVoucherOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo Voucher
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo Voucher mới</DialogTitle>
                  <DialogDescription>
                    Giảm giá tối đa là 100,000 VND để đảm bảo hoa hồng cho bạn
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateVoucher}>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="code">Mã voucher</Label>
                      <Input id="code" name="code" placeholder="VD: MYCODE2024" required />
                    </div>
                    <div>
                      <Label htmlFor="discountType">Loại giảm giá</Label>
                      <Select name="discountType" defaultValue="FIXED_AMOUNT">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIXED_AMOUNT">Số tiền cố định</SelectItem>
                          <SelectItem value="PERCENT">Phần trăm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="discountValue">Giá trị giảm</Label>
                      <Input
                        id="discountValue"
                        name="discountValue"
                        type="number"
                        max="100000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxDiscountAmount">Giảm tối đa (VND)</Label>
                      <Input
                        id="maxDiscountAmount"
                        name="maxDiscountAmount"
                        type="number"
                        max="100000"
                        placeholder="100000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="usageLimit">Giới hạn sử dụng</Label>
                      <Input
                        id="usageLimit"
                        name="usageLimit"
                        type="number"
                        placeholder="Không giới hạn"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createVoucherMutation.isPending}>
                      {createVoucherMutation.isPending ? 'Đang tạo...' : 'Tạo voucher'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng thu nhập</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.totalEarnings || 0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Số dư khả dụng</CardTitle>
              <Wallet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(walletData?.balance || 0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{summary?.totalOrders || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng vé bán</CardTitle>
              <Ticket className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{summary?.totalTicketsSold || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Chi tiết hoa hồng</TabsTrigger>
            <TabsTrigger value="vouchers">Voucher của tôi</TabsTrigger>
            <TabsTrigger value="withdrawals">Lịch sử rút tiền</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Chi tiết hoa hồng</CardTitle>
                  <Select
                    value={commissionFilter || 'all'}
                    onValueChange={(v) => setCommissionFilter(v === 'all' ? undefined : (v as any))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="PAID">Đã thanh toán</SelectItem>
                      <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead className="text-center">Số vé</TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            Hoa hồng gốc
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>100,000 VND × Số vé</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Đã giảm</TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            Thu nhập ròng
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Hoa hồng gốc - Đã giảm = Thu nhập ròng</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionsLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 8 }).map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : commissionsData?.data?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Chưa có dữ liệu hoa hồng
                          </TableCell>
                        </TableRow>
                      ) : (
                        commissionsData?.data?.map((item: CommissionDetail) => (
                          <TableRow key={item.orderId}>
                            <TableCell className="font-medium">{item.orderCode}</TableCell>
                            <TableCell>
                              {format(new Date(item.orderDate), 'dd/MM/yyyy', { locale: vi })}
                            </TableCell>
                            <TableCell>{item.customerName}</TableCell>
                            <TableCell className="text-center">{item.ticketQty}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.totalCommission)}
                            </TableCell>
                            <TableCell className="text-right text-red-600">
                              -{formatCurrency(item.discountGiven)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-green-600">
                              {formatCurrency(item.netEarnings)}
                            </TableCell>
                            <TableCell>{getStatusBadge(item.commissionStatus)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TooltipProvider>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Voucher của tôi</CardTitle>
                <CardDescription>Quản lý các mã giảm giá bạn đã tạo</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã voucher</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead className="text-right">Giá trị</TableHead>
                      <TableHead className="text-center">Đã dùng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vouchersLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : vouchersData?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Bạn chưa tạo voucher nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      vouchersData?.map((voucher: CollaboratorVoucher) => (
                        <TableRow key={voucher.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                {voucher.code}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyCode(voucher.code)}
                              >
                                {copiedCode === voucher.code ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {voucher.discountType === 'PERCENT' ? 'Phần trăm' : 'Cố định'}
                          </TableCell>
                          <TableCell className="text-right">
                            {voucher.discountType === 'PERCENT'
                              ? `${voucher.discountValue}%`
                              : formatCurrency(voucher.discountValue)}
                          </TableCell>
                          <TableCell className="text-center">
                            {voucher.usedCount}
                            {voucher.usageLimit ? `/${voucher.usageLimit}` : ''}
                          </TableCell>
                          <TableCell>
                            {voucher.isActive ? (
                              <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
                            ) : (
                              <Badge variant="outline">Tắt</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(voucher.createdAt), 'dd/MM/yyyy', { locale: vi })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử rút tiền</CardTitle>
                <CardDescription>Các yêu cầu rút tiền của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                      <TableHead>Ngân hàng</TableHead>
                      <TableHead>Số tài khoản</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawalsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : withdrawalsData?.items?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Chưa có yêu cầu rút tiền
                        </TableCell>
                      </TableRow>
                    ) : (
                      withdrawalsData?.items?.map((item: WithdrawalRequest) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.amount)}
                          </TableCell>
                          <TableCell>{item.bankName}</TableCell>
                          <TableCell className="font-mono">{item.accountNumber}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {item.adminNote || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Commission Calculation Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <AlertCircle className="h-5 w-5" />
              Cách tính hoa hồng
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Hoa hồng gốc:</strong> 100,000 VND × Số lượng vé trong đơn hàng
              </li>
              <li>
                <strong>Thu nhập ròng:</strong> Hoa hồng gốc - Số tiền đã giảm cho khách
              </li>
              <li>
                <strong>Giới hạn giảm giá:</strong> Tối đa 100,000 VND/voucher để đảm bảo bạn luôn có
                thu nhập
              </li>
              <li>
                <strong>Thanh toán:</strong> Hoa hồng sẽ được cộng vào ví khi đơn hàng được thanh
                toán thành công
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
