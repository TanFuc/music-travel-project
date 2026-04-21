'use client';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { toast } from 'sonner';
import { formatDateTime } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  QrCode,
  Search,
  Users,
  Ticket,
  AlertCircle,
  RefreshCw,
  Keyboard,
  Camera,
} from 'lucide-react';
interface VerificationResult {
  success: boolean;
  message: string;
  verification?: {
    id: number;
    ticketId: number;
    showId: number;
    userId: number;
    verifiedAt: string;
    isReEntry: boolean;
  };
  ticketInfo?: {
    ticketCode: string;
    holderName: string;
    ticketTier?: string;
    ticketClass?: string;
  };
  showInfo?: {
    id: number;
    title: string;
    currentAttendance: number;
    maxCapacity?: number;
  };
  error?: {
    code: string;
    details?: string;
  };
}
interface AttendanceStats {
  showId: number;
  showTitle: string;
  maxCapacity: number | null;
  currentAttendance: number;
  attendancePercentage: number | null;
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
  reEntries: number;
  verificationsBreakdown: {
    QR_SCAN: number;
    MANUAL_ENTRY: number;
  };
  recentVerifications: Array<{
    id: number;
    ticketCode: string;
    holderName: string;
    verifiedAt: string;
    isReEntry: boolean;
  }>;
}
export default function ShowCheckInPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const showId = parseInt(params.id);
  const queryClient = useQueryClient();
  const [ticketCode, setTicketCode] = useState('');
  const [scanMode, setScanMode] = useState<'manual' | 'qr'>('manual');
  const [lastResult, setLastResult] = useState<VerificationResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['show-attendance', showId],
    queryFn: () => get<AttendanceStats>(`/shows/${showId}/verifications/attendance`),
    refetchInterval: 5000,
  });
  const verifyMutation = useMutation({
    mutationFn: (code: string) =>
      post<VerificationResult>('/tickets/verify', {
        ticketCode: code,
        showId,
        verificationMethod: scanMode === 'qr' ? 'QR_SCAN' : 'MANUAL_ENTRY',
        deviceInfo: navigator.userAgent,
      }),
    onSuccess: (result) => {
      setLastResult(result);
      if (result.success) {
        toast.success(result.message, {
          description: `${result.ticketInfo?.holderName} - ${result.ticketInfo?.ticketTier || result.ticketInfo?.ticketClass || 'Standard'}`,
        });
        playSound('success');
      } else {
        toast.error(result.message, {
          description: result.error?.details,
        });
        playSound('error');
      }
      setTicketCode('');
      queryClient.invalidateQueries({ queryKey: ['show-attendance', showId] });
      inputRef.current?.focus();
    },
    onError: (error: any) => {
      toast.error('Lỗi xác thực vé', {
        description: error.response?.data?.message || 'Có lỗi xảy ra',
      });
      setLastResult({
        success: false,
        message: 'Lỗi xác thực vé',
        error: { code: 'NETWORK_ERROR' },
      });
      playSound('error');
    },
  });
  const playSound = (type: 'success' | 'error') => {
    try {
      const audio = new Audio(type === 'success' ? '/sounds/success.mp3' : '/sounds/error.mp3');
      audio.play().catch(() => {});
    } catch {}
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketCode.trim()) {
      verifyMutation.mutate(ticketCode.trim());
    }
  };
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== inputRef.current && /^[a-zA-Z0-9-]$/.test(e.key)) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const getCapacityColor = (percentage: number | null) => {
    if (percentage === null) return 'bg-gray-200';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Check-In Khán Giả</h1>
          <p className="text-neutral-600">
            {stats?.showTitle || 'Đang tải...'} - Xác thực vé và quản lý lượng vào cổng
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['show-attendance', showId] })}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Hiện tại</p>
                <p className="text-3xl font-bold">
                  {isLoadingStats ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    stats?.currentAttendance || 0
                  )}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            {stats?.maxCapacity && (
              <div className="mt-2">
                <div className="mb-1 flex justify-between text-xs text-neutral-500">
                  <span>Sức chứa: {stats.maxCapacity}</span>
                  <span>{stats.attendancePercentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full ${getCapacityColor(stats.attendancePercentage)} transition-all`}
                    style={{ width: `${Math.min(stats.attendancePercentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Tổng xác thực</p>
                <p className="text-3xl font-bold text-green-600">
                  {isLoadingStats ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    stats?.successfulVerifications || 0
                  )}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Quét QR</p>
                <p className="text-3xl font-bold text-purple-600">
                  {isLoadingStats ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    stats?.verificationsBreakdown?.QR_SCAN || 0
                  )}
                </p>
              </div>
              <QrCode className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Nhập tay</p>
                <p className="text-3xl font-bold text-orange-600">
                  {isLoadingStats ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    stats?.verificationsBreakdown?.MANUAL_ENTRY || 0
                  )}
                </p>
              </div>
              <Keyboard className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-dashed">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Ticket className="h-6 w-6" />
            Xác Thực Vé
          </CardTitle>
          <CardDescription>
            Quét mã QR hoặc nhập mã vé để xác thực. Hỗ trợ máy quét barcode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-center gap-2">
            <Button
              variant={scanMode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScanMode('manual')}
            >
              <Keyboard className="mr-2 h-4 w-4" />
              Nhập mã
            </Button>
            <Button
              variant={scanMode === 'qr' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScanMode('qr')}
            >
              <Camera className="mr-2 h-4 w-4" />
              Quét QR
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Nhập mã vé (VD: TK-XXXXX-XXXXX)"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
              className="h-14 text-center font-mono text-lg"
              autoComplete="off"
              autoFocus
            />
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8"
              disabled={verifyMutation.isPending || !ticketCode.trim()}
            >
              {verifyMutation.isPending ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </form>

          {lastResult && (
            <div
              className={`mt-6 rounded-lg p-6 text-center ${lastResult.success ? 'border border-green-200 bg-green-50' : 'border border-red-200 bg-red-50'}`}
            >
              <div className="mb-2 flex items-center justify-center gap-2">
                {lastResult.success ? (
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-500" />
                )}
              </div>
              <h3
                className={`text-xl font-bold ${lastResult.success ? 'text-green-700' : 'text-red-700'}`}
              >
                {lastResult.message}
              </h3>
              {lastResult.ticketInfo && (
                <div className="mt-2 text-sm text-neutral-600">
                  <p className="font-medium">{lastResult.ticketInfo.holderName}</p>
                  <p>
                    {lastResult.ticketInfo.ticketCode} •{' '}
                    {lastResult.ticketInfo.ticketTier ||
                      lastResult.ticketInfo.ticketClass ||
                      'Standard'}
                  </p>
                </div>
              )}
              {lastResult.error && (
                <p className="mt-2 text-sm text-red-600">{lastResult.error.details}</p>
              )}
              {lastResult.verification?.isReEntry && (
                <Badge variant="outline" className="mt-2">
                  Re-entry
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Xác thực gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !stats?.recentVerifications?.length ? (
            <div className="py-8 text-center text-neutral-500">
              <Ticket className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>Chưa có xác thực nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentVerifications.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-lg bg-neutral-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{v.holderName}</p>
                      <p className="font-mono text-sm text-neutral-500">{v.ticketCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600">{formatDateTime(v.verifiedAt)}</p>
                    {v.isReEntry && (
                      <Badge variant="outline" className="text-xs">
                        Re-entry
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {stats?.attendancePercentage && stats.attendancePercentage >= 90 && (
        <div className="fixed bottom-4 right-4 flex animate-pulse items-center gap-2 rounded-lg bg-red-500 px-6 py-3 text-white shadow-lg">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Gần đầy! {stats.attendancePercentage}% sức chứa</span>
        </div>
      )}
    </div>
  );
}
