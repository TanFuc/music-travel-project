'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentMethodConfigService, PaymentMethodConfig, UpdatePaymentMethodConfigDto, CreatePaymentMethodConfigDto, PaymentMethod } from '@/services/payment-method-config.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Edit, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function PaymentMethodsPage() {
    usePageTitle();
    const queryClient = useQueryClient();
    const [editingConfig, setEditingConfig] = useState<PaymentMethodConfig | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<CreatePaymentMethodConfigDto>({
        method: 'BANK_QR' as PaymentMethod,
        name: '',
        discountPercentage: 0,
        isActive: true,
    });

    // Fetch configs
    const { data: configs, isLoading } = useQuery({
        queryKey: ['admin-payment-configs'],
        queryFn: paymentMethodConfigService.getAll,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: paymentMethodConfigService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-payment-configs'] });
            toast.success('Thêm cấu hình thành công');
            setIsOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePaymentMethodConfigDto }) =>
            paymentMethodConfigService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-payment-configs'] });
            toast.success('Cập nhật thành công');
            setIsOpen(false);
            setEditingConfig(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingConfig) {
            updateMutation.mutate({ id: editingConfig.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const openEdit = (config: PaymentMethodConfig) => {
        setEditingConfig(config);
        setFormData({
            method: config.method,
            name: config.name,
            discountPercentage: Number(config.discountPercentage),
            isActive: config.isActive,
        });
        setIsOpen(true);
    };

    const openCreate = () => {
        setEditingConfig(null);
        setFormData({
            method: 'BANK_QR' as PaymentMethod,
            name: '',
            discountPercentage: 0,
            isActive: true,
        });
        setIsOpen(true);
    };

    const toggleActive = (config: PaymentMethodConfig) => {
        updateMutation.mutate({
            id: config.id,
            data: { isActive: !config.isActive }
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Cấu hình thanh toán & Giảm giá</h1>
                    <p className="text-neutral-500">Quản lý phương thức thanh toán và % giảm giá</p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" /> Thêm mới
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách phương thức</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Mã phương thức</TableHead>
                                    <TableHead>Tên hiển thị</TableHead>
                                    <TableHead>Giảm giá (%)</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {configs?.map((config) => (
                                    <TableRow key={config.id}>
                                        <TableCell>{config.id}</TableCell>
                                        <TableCell className="font-mono">{config.method}</TableCell>
                                        <TableCell className="font-medium">{config.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={Number(config.discountPercentage) > 0 ? 'destructive' : 'secondary'}>
                                                {Number(config.discountPercentage)}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={config.isActive ? 'success' : 'secondary'}>
                                                {config.isActive ? 'Hoạt động' : 'Tắt'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end items-center space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(config)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Switch checked={config.isActive} onCheckedChange={() => toggleActive(config)} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!configs?.length && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                                            Chưa có cấu hình nào
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingConfig ? 'Chỉnh sửa cấu hình' : 'Thêm cấu hình mới'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Mã phương thức</Label>
                            <Input
                                value={formData.method}
                                onChange={e => setFormData({ ...formData, method: e.target.value as any })}
                                placeholder="VD: MOMO, VNPAY, BANK_QR"
                                disabled={!!editingConfig} // Không cho sửa key khi edit
                            />
                            <p className="text-xs text-neutral-500 mt-1">Các mã hợp lệ: MOMO, VNPAY, BANKING, WALLET, CASH, PAYOS, BANK_QR</p>
                        </div>
                        <div>
                            <Label>Tên hiển thị</Label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="VD: Ví điện tử MoMo"
                                required
                            />
                        </div>
                        <div>
                            <Label>% Giảm giá</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={formData.discountPercentage}
                                onChange={e => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.isActive}
                                onCheckedChange={checked => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label>Kích hoạt</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {createMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : 'Lưu'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
