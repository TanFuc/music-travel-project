'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Edit,
  Trash2,
  Phone,
  MessageCircle,
  Mail,
  Send,
  Loader2,
  Link2,
  FileText,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  contactChannelService,
  ContactChannel,
  ContactChannelType,
  CreateContactChannelDto,
  UpdateContactChannelDto,
} from '@/services/contact-channels.service';
const CHANNEL_TYPE_LABELS: Partial<Record<ContactChannelType, string>> = {
  PHONE: 'Điện thoại',
  ZALO: 'Zalo',
  MESSENGER: 'Messenger',
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
  FOOTER_LOGO_URL: 'Footer - Logo URL',
  FOOTER_LOGO_ALT: 'Footer - Logo ALT',
  FOOTER_BRAND_NAME: 'Footer - Tên thương hiệu',
  FOOTER_BRAND_DESCRIPTION: 'Footer - Mô tả thương hiệu',
  FOOTER_SECTION_ABOUT_TITLE: 'Footer - Tiêu đề cột Về chúng tôi',
  FOOTER_SECTION_POLICY_TITLE: 'Footer - Tiêu đề cột Chính sách',
  FOOTER_SECTION_CONTACT_TITLE: 'Footer - Tiêu đề cột Liên hệ',
  FOOTER_ABOUT_LINK: 'Footer - Link Về chúng tôi',
  FOOTER_POLICY_LINK: 'Footer - Link Chính sách',
  FOOTER_SOCIAL_LINK: 'Footer - Link mạng xã hội',
  FOOTER_CONTACT_PHONE: 'Footer - Số điện thoại',
  FOOTER_CONTACT_EMAIL: 'Footer - Email',
  FOOTER_CONTACT_ADDRESS: 'Footer - Địa chỉ',
  FOOTER_COPYRIGHT_TEXT: 'Footer - Copyright',
  FOOTER_CERTIFICATION_TEXT: 'Footer - Chứng nhận',
};
const CHANNEL_ICONS: Partial<Record<ContactChannelType, React.ReactNode>> = {
  PHONE: <Phone className="h-4 w-4" />,
  ZALO: <MessageCircle className="h-4 w-4" />,
  MESSENGER: <Send className="h-4 w-4" />,
  EMAIL: <Mail className="h-4 w-4" />,
  WHATSAPP: <MessageCircle className="h-4 w-4" />,
  FOOTER_LOGO_URL: <Building2 className="h-4 w-4" />,
  FOOTER_LOGO_ALT: <Building2 className="h-4 w-4" />,
  FOOTER_BRAND_NAME: <Building2 className="h-4 w-4" />,
  FOOTER_BRAND_DESCRIPTION: <FileText className="h-4 w-4" />,
  FOOTER_SECTION_ABOUT_TITLE: <FileText className="h-4 w-4" />,
  FOOTER_SECTION_POLICY_TITLE: <FileText className="h-4 w-4" />,
  FOOTER_SECTION_CONTACT_TITLE: <FileText className="h-4 w-4" />,
  FOOTER_ABOUT_LINK: <Link2 className="h-4 w-4" />,
  FOOTER_POLICY_LINK: <Link2 className="h-4 w-4" />,
  FOOTER_SOCIAL_LINK: <Link2 className="h-4 w-4" />,
  FOOTER_CONTACT_PHONE: <Phone className="h-4 w-4" />,
  FOOTER_CONTACT_EMAIL: <Mail className="h-4 w-4" />,
  FOOTER_CONTACT_ADDRESS: <Building2 className="h-4 w-4" />,
  FOOTER_COPYRIGHT_TEXT: <FileText className="h-4 w-4" />,
  FOOTER_CERTIFICATION_TEXT: <FileText className="h-4 w-4" />,
};
function getChannelTypeLabel(type: ContactChannelType): string {
  return CHANNEL_TYPE_LABELS[type] || type;
}
function getChannelTypeIcon(type: ContactChannelType): React.ReactNode {
  return CHANNEL_ICONS[type] || <Link2 className="h-4 w-4" />;
}
function getValueHint(type: ContactChannelType): string {
  switch (type) {
    case ContactChannelType.PHONE:
      return 'Số điện thoại (VD: 0912345678)';
    case ContactChannelType.ZALO:
      return 'Số Zalo hoặc link (VD: 0912345678)';
    case ContactChannelType.MESSENGER:
      return 'Link Messenger (VD: https://m.me/username)';
    case ContactChannelType.EMAIL:
      return 'Địa chỉ email (VD: support@example.com)';
    case ContactChannelType.WHATSAPP:
      return 'Số WhatsApp (VD: 84912345678)';
    case ContactChannelType.FOOTER_LOGO_URL:
      return 'URL logo footer (VD: https://.../logo.png)';
    case ContactChannelType.FOOTER_LOGO_ALT:
      return 'ALT text cho logo';
    case ContactChannelType.FOOTER_BRAND_NAME:
      return 'Tên thương hiệu hiển thị ở footer';
    case ContactChannelType.FOOTER_BRAND_DESCRIPTION:
      return 'Mô tả ngắn thương hiệu ở footer';
    case ContactChannelType.FOOTER_SECTION_ABOUT_TITLE:
    case ContactChannelType.FOOTER_SECTION_POLICY_TITLE:
    case ContactChannelType.FOOTER_SECTION_CONTACT_TITLE:
      return 'Tiêu đề cột trong footer';
    case ContactChannelType.FOOTER_ABOUT_LINK:
    case ContactChannelType.FOOTER_POLICY_LINK:
      return 'Link nội bộ/footer (VD: /about)';
    case ContactChannelType.FOOTER_SOCIAL_LINK:
      return 'Link mạng xã hội (VD: https://facebook.com/...)';
    case ContactChannelType.FOOTER_CONTACT_PHONE:
      return 'Số điện thoại footer';
    case ContactChannelType.FOOTER_CONTACT_EMAIL:
      return 'Email footer';
    case ContactChannelType.FOOTER_CONTACT_ADDRESS:
      return 'Địa chỉ footer';
    case ContactChannelType.FOOTER_COPYRIGHT_TEXT:
      return 'Nội dung copyright footer';
    case ContactChannelType.FOOTER_CERTIFICATION_TEXT:
      return 'Nội dung chứng nhận footer';
    default:
      return 'Giá trị hiển thị của kênh';
  }
}
export default function ContactChannelsPage() {
  const queryClient = useQueryClient();
  const [editingChannel, setEditingChannel] = useState<ContactChannel | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['admin-contact-channels'],
    queryFn: contactChannelService.getAll,
  });
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý kênh liên hệ</h1>
          <p className="mt-1 text-gray-600">Quản lý các kênh liên hệ hiển thị trên trang chủ</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Tạo kênh mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách kênh liên hệ</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !channels.length ? (
            <div className="py-8 text-center text-gray-500">Chưa có kênh liên hệ nào</div>
          ) : (
            <div className="space-y-3">
              {channels.map((channel) => (
                <Card key={channel.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: channel.colorCode || '#3b82f6' }}
                        >
                          {getChannelTypeIcon(channel.type)}
                        </div>
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold">{channel.label}</h3>
                            <Badge variant="outline">{getChannelTypeLabel(channel.type)}</Badge>
                            <Badge variant={channel.isActive ? 'default' : 'secondary'}>
                              {channel.isActive ? 'Hoạt động' : 'Ngừng'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{channel.value}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            Thứ tự: {channel.displayOrder}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(channel)}>
                          <Edit className="mr-1 h-4 w-4" />
                          Sửa
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Xóa
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa kênh "{channel.label}"? Hành động này
                                không thể hoàn tác.
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

      <ChannelDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
        title="Tạo kênh liên hệ mới"
      />

      <ChannelDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={(data) =>
          editingChannel && updateMutation.mutate({ id: editingChannel.id, data })
        }
        isLoading={updateMutation.isPending}
        title="Chỉnh sửa kênh liên hệ"
        initialData={editingChannel}
      />
    </div>
  );
}
interface ChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateContactChannelDto) => void;
  isLoading: boolean;
  title: string;
  initialData?: ContactChannel | null;
}
function ChannelDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  title,
  initialData,
}: ChannelDialogProps) {
  const [formData, setFormData] = useState<CreateContactChannelDto>({
    type: ContactChannelType.PHONE,
    label: '',
    value: '',
    icon: '',
    colorCode: '#3b82f6',
    displayOrder: 0,
    isActive: true,
  });
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
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value as ContactChannelType }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ContactChannelType).map((value) => (
                  <SelectItem key={value} value={value}>
                    {getChannelTypeLabel(value)}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="VD: Hotline hỗ trợ"
              required
            />
          </div>

          <div>
            <Label htmlFor="value">Giá trị *</Label>
            <Input
              id="value"
              value={formData.value}
              onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
              placeholder="VD: 0912345678 hoặc https://m.me/..."
              required
            />
            <p className="mt-1 text-xs text-gray-500">{getValueHint(formData.type)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="colorCode">Màu sắc</Label>
              <Input
                id="colorCode"
                type="color"
                value={formData.colorCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, colorCode: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
              <Input
                id="displayOrder"
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))
                }
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked as boolean }))
              }
            />
            <Label htmlFor="isActive">Đang hoạt động</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
