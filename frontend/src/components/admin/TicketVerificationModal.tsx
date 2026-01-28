'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, QrCode, User, Calendar, Music, AlertCircle, CheckCircle2 } from 'lucide-react';
import { get, patch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TicketVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TicketVerificationModal({ isOpen, onClose }: TicketVerificationModalProps) {
    const [serialNumber, setSerialNumber] = useState('');
    const [searchCode, setSearchCode] = useState('');
    const [selectedShowId, setSelectedShowId] = useState<string>('');
    const queryClient = useQueryClient();

    const { data: ticket, isLoading, error, refetch } = useQuery({
        queryKey: ['admin-ticket-search', searchCode],
        queryFn: () => get<any>(`/admin/tickets/search/${searchCode}`),
        enabled: !!searchCode,
        retry: false,
    });

    const { data: shows } = useQuery({
        queryKey: ['admin-shows-upcoming'],
        queryFn: () => get<any>(`/admin/shows?limit=100&status=UPCOMING`),
        enabled: isOpen,
    });

    const checkInMutation = useMutation({
        mutationFn: (data: { code: string; showId: number }) =>
            patch(`/admin/tickets/check-in/${data.code}`, { showId: data.showId }),
        onSuccess: () => {
            toast.success('Check-in thành công!');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Lỗi khi thực hiện check-in');
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: (data: { id: number; status: string }) =>
            patch(`/admin/tickets/${data.id}/status`, { status: data.status }),
        onSuccess: () => {
            toast.success('Cập nhật trạng thái thành công!');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Lỗi khi cập nhật trạng thái');
        }
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchCode(serialNumber);
    };

    const handleCheckIn = () => {
        if (!selectedShowId) {
            toast.error('Vui lòng chọn show diễn để check-in');
            return;
        }
        checkInMutation.mutate({ code: ticket.ticketCode, showId: parseInt(selectedShowId) });
    };

    const statusColors: Record<string, string> = {
        AVAILABLE: 'bg-green-100 text-green-800',
        LOCKED: 'bg-yellow-100 text-yellow-800',
        SOLD: 'bg-blue-100 text-blue-800',
        USED: 'bg-gray-100 text-gray-800',
        CANCELLED: 'bg-red-100 text-red-800',
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Kiểm tra & Quyết toán vé</DialogTitle>
                    <DialogDescription>
                        Nhập số seri hoặc quét mã QR trên vé để kiểm tra thông tin.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder="Nhập số seri vé (vd: TK001...)"
                                value={serialNumber}
                                onChange={(e) => setSerialNumber(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Đang kiểm tra...' : 'Kiểm tra'}
                        </Button>
                    </form>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
                            <AlertCircle className="h-5 w-5" />
                            <p>Không tìm thấy thông tin vé này hoặc vé không hợp lệ.</p>
                        </div>
                    )}

                    {ticket && (
                        <Card className="border-neutral-200 shadow-sm overflow-hidden">
                            <div className="p-4 bg-neutral-50 border-b flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider">Mã vé:</span>
                                    <span className="font-mono font-bold">{ticket.ticketCode}</span>
                                </div>
                                <Badge className={statusColors[ticket.status] || ''}>
                                    {ticket.status}
                                </Badge>
                            </div>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs text-neutral-500 font-medium flex items-center gap-1 uppercase">
                                            <Music className="h-3 w-3" /> Hạng vé
                                        </p>
                                        <p className="font-bold text-lg">
                                            {ticket.ticketTier?.name || ticket.ticketClass?.name || 'Vãng lai'}
                                        </p>
                                        <p className="text-brand-600 font-bold">
                                            {formatCurrency(ticket.ticketTier?.price || ticket.ticketClass?.price || 0)}
                                        </p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-xs text-neutral-500 font-medium flex items-center gap-1 justify-end uppercase">
                                            <User className="h-3 w-3" /> Người sở hữu
                                        </p>
                                        <p className="font-bold">
                                            {ticket.booking?.user?.fullName || 'Vé vãng lai'}
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            {ticket.booking?.user?.phoneNumber || '--'}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t space-y-4">
                                    {ticket.status === 'USED' ? (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
                                            <CheckCircle2 className="h-5 w-5" />
                                            <div>
                                                <p className="font-bold">Vé đã được check-in</p>
                                                <p className="text-sm">Tại show: <strong>{ticket.redeemedShow?.title || 'Không xác định'}</strong></p>
                                                <p className="text-sm italic">Thời gian: {formatDate(ticket.checkedInAt)}</p>
                                            </div>
                                        </div>
                                    ) : ticket.status === 'SOLD' || ticket.status === 'AVAILABLE' ? (
                                        <div className="space-y-3">
                                            <Label>Chọn show diễn để Check-in</Label>
                                            <Select value={selectedShowId} onValueChange={setSelectedShowId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn show diễn (đang và sắp diễn ra)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {shows?.items?.map((show: any) => (
                                                        <SelectItem key={show.id} value={show.id.toString()}>
                                                            {show.title} ({formatDate(show.performTime)})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                className="w-full h-12 text-lg font-bold gap-2"
                                                onClick={handleCheckIn}
                                                disabled={checkInMutation.isPending}
                                            >
                                                <CheckCircle2 className="h-5 w-5" />
                                                Thực hiện Check-in
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-yellow-800">
                                            <AlertCircle className="h-5 w-5" />
                                            <p>Vé hiện không ở trạng thái sẵn sàng để check-in.</p>
                                        </div>
                                    )}
                                </div>

                                {ticket.status !== 'USED' && ticket.status !== 'CANCELLED' && (
                                    <div className="pt-2 flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                if (confirm('Bạn có chắc chắn muốn hủy vé này?')) {
                                                    updateStatusMutation.mutate({ id: ticket.id, status: 'CANCELLED' });
                                                }
                                            }}
                                        >
                                            Hủy vé
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <DialogFooter className="sm:justify-start">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


