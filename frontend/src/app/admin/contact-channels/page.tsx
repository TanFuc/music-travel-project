'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Phone, MessageCircle, Mail, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { contactChannelService, ContactChannel, ContactChannelType, CreateContactChannelDto, UpdateContactChannelDto } from '@/services/contact-channels.service';

const CHANNEL_TYPE_LABELS: Record<ContactChannelType, string> = {
    PHONE: 'Điện thoại',
    ZALO: 'Zalo',
    MESSENGER: 'Messenger',
    EMAIL: 'Email',
    WHATSAPP: 'WhatsApp',
};

const CHANNEL_ICONS: Record<ContactChannelType, React.ReactNode> = {
    PHONE: <Phone className="h-4 w-4" />,
    ZALO: <MessageCircle className="h-4 w-4" />,
    MESSENGER: <Send className="h-4 w-4" />,
    EMAIL: <Mail className="h-4 w-4" />,
    WHATSAPP: <MessageCircle className="h-4 w-4" />,
};

export default function ContactChannelsPage() {
    const queryClient = useQueryClient();
    const [editingChannel, setEditingChannel] = useState<ContactChannel | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);

    // Fetch channels
    const { data: channels = [], isLoading } = useQuery({
        queryKey: ['admin-contact-channels'],
        queryFn: contactChannelService.getAll,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: contactChannelService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-contact-channels'] });
            queryClient.invalidateQueries({ queryKey: ['contact-channels-active'] });
            toast.success('Tạo kênh liên hệ thành công');
            setShowCreateDialog(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo kênh liên hệ');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateContactChannelDto }) =>
            contactChannelService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-contact-channels'] });
            queryClient.invalidateQueries({ queryKey: ['contact-channels-active'] });
            toast.success('Cập nhật kênh liên hệ thành công');
            setShowEditDialog(false);
            setEditingChannel(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật kênh liên hệ');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: contactChannelService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-contact-channels'] });
            queryClient.invalidateQueries({ queryKey: ['contact-channels-active'] });
            toast.success('Xóa kênh liên hệ thành công');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa kênh liên hệ');
        },
    });

    const handleEdit = (channel: ContactChannel) => {
        setEditingChannel(channel);
        setShowEditDialog(true);
    };

    const handleDelete = async (id: number) => {
        await deleteMutation.mutateAsync(id);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý kênh liên hệ</h1>
                    <p className="text-gray-600 mt-1">Quản lý các kênh liên hệ hiển thị trên trang chủ</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo kênh mới
                </Button>
            </div>

            {/* Channels List */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách kênh liên hệ</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : !channels.length ? (
                        <div className="text-center py-8 text-gray-500">
                            Chưa có kênh liên hệ nào
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {channels.map((channel) => (
                                <Card key={channel.id} className="border">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="flex items-center justify-center w-12 h-12 rounded-full text-white"
                                                    style={{ backgroundColor: channel.colorCode || '#3b82f6' }}
                                                >
                                                    {CHANNEL_ICONS[channel.type]}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold">{channel.label}</h3>
                                                        <Badge variant="outline">{CHANNEL_TYPE_LABELS[channel.type]}</Badge>
                                                        <Badge variant={channel.isActive ? 'default' : 'secondary'}>
                                                            {channel.isActive ? 'Hoạt động' : 'Ngừng'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{channel.value}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Thứ tự: {channel.displayOrder}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(channel)}
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Sửa
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                            Xóa
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Bạn có chắc chắn muốn xóa kênh "{channel.label}"? Hành động này không thể hoàn tác.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(channel.id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Xóa
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <ChannelDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSubmit={(data) => createMutation.mutate(data)}
                isLoading={createMutation.isPending}
                title="Tạo kênh liên hệ mới"
            />

            {/* Edit Dialog */}
            <ChannelDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                onSubmit={(data) => editingChannel && updateMutation.mutate({ id: editingChannel.id, data })}
                isLoading={updateMutation.isPending}
                title="Chỉnh sửa kênh liên hệ"
                initialData={editingChannel}
            />
        </div>
    );
}

// Channel Form Dialog Component
interface ChannelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateContactChannelDto) => void;
    isLoading: boolean;
    title: string;
    initialData?: ContactChannel | null;
}

function ChannelDialog({ open, onOpenChange, onSubmit, isLoading, title, initialData }: ChannelDialogProps) {
    const [formData, setFormData] = useState<CreateContactChannelDto>({
        type: ContactChannelType.PHONE,
        label: '',
        value: '',
        icon: '',
        colorCode: '#3b82f6',
        displayOrder: 0,
        isActive: true,
    });

    // Update form when initialData or open changes
    useEffect(() => {
        if (initialData && open) {
            setFormData({
                type: initialData.type,
                label: initialData.label,
                value: initialData.value,
                icon: initialData.icon,
                colorCode: initialData.colorCode || '#3b82f6',
                displayOrder: initialData.displayOrder,
                isActive: initialData.isActive,
            });
        } else if (!open) {
            // Reset form when dialog closes
            setFormData({
                type: ContactChannelType.PHONE,
                label: '',
                value: '',
                icon: '',
                colorCode: '#3b82f6',
                displayOrder: 0,
                isActive: true,
            });
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Chỉnh sửa thông tin kênh liên hệ' : 'Tạo kênh liên hệ mới'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="type">Loại kênh *</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as ContactChannelType }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(CHANNEL_TYPE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="label">Nhãn hiển thị *</Label>
                        <Input
                            id="label"
                            value={formData.label}
                            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="VD: Hotline hỗ trợ"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="value">Giá trị *</Label>
                        <Input
                            id="value"
                            value={formData.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                            placeholder="VD: 0912345678 hoặc https://m.me/..."
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.type === 'PHONE' && 'Số điện thoại (VD: 0912345678)'}
                            {formData.type === 'ZALO' && 'Số Zalo hoặc link (VD: 0912345678)'}
                            {formData.type === 'MESSENGER' && 'Link Messenger (VD: https://m.me/username)'}
                            {formData.type === 'EMAIL' && 'Địa chỉ email (VD: support@example.com)'}
                            {formData.type === 'WHATSAPP' && 'Số WhatsApp (VD: 84912345678)'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="colorCode">Màu sắc</Label>
                            <Input
                                id="colorCode"
                                type="color"
                                value={formData.colorCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
                            <Input
                                id="displayOrder"
                                type="number"
                                min="0"
                                value={formData.displayOrder}
                                onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked as boolean }))}
                        />
                        <Label htmlFor="isActive">Đang hoạt động</Label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {initialData ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
