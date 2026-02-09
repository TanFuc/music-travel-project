'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Search, Package, Users, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { singerPackageService, type SingerPackage, type CreateSingerPackageDto, type UpdateSingerPackageDto, type SingerPackageFilterDto } from '@/services/singer-packages.service';

const LIMIT_OPTIONS = [
  { value: 10, label: '10 / trang' },
  { value: 25, label: '25 / trang' },
  { value: 50, label: '50 / trang' },
  { value: 100, label: '100 / trang' },
];

export default function SingerPackagesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SingerPackageFilterDto>({
    page: 1,
    limit: 10,
    isActive: undefined,
    search: '',
  });
  const [editingPackage, setEditingPackage] = useState<SingerPackage | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Fetch packages
  const { data: packagesData, isLoading, error } = useQuery({
    queryKey: ['admin-singer-packages', filters],
    queryFn: () => singerPackageService.getPackages(filters),
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['singer-packages-statistics'],
    queryFn: singerPackageService.getStatistics,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: singerPackageService.createPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-singer-packages'] });
      queryClient.invalidateQueries({ queryKey: ['singer-packages-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['singer-packages-active'] });
      toast.success('Tạo gói đăng ký thành công');
      setShowCreateDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo gói đăng ký');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSingerPackageDto }) =>
      singerPackageService.updatePackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-singer-packages'] });
      queryClient.invalidateQueries({ queryKey: ['singer-packages-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['singer-packages-active'] });
      toast.success('Cập nhật gói đăng ký thành công');
      setShowEditDialog(false);
      setEditingPackage(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật gói đăng ký');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: singerPackageService.deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-singer-packages'] });
      queryClient.invalidateQueries({ queryKey: ['singer-packages-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['singer-packages-active'] });
      toast.success('Xóa gói đăng ký thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa gói đăng ký');
    },
  });

  const handleFilterChange = (key: keyof SingerPackageFilterDto, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset page when other filters change
    }));
  };

  const handleEdit = (pkg: SingerPackage) => {
    setEditingPackage(pkg);
    setShowEditDialog(true);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý gói đăng ký ca sĩ</h1>
          <p className="text-gray-600 mt-1">Quản lý các gói đăng ký cho chương trình ca sĩ</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Tạo gói mới
        </Button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Tổng gói</p>
                  <p className="text-2xl font-bold">{statistics.totalPackages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Đang hoạt động</p>
                  <p className="text-2xl font-bold">{statistics.activePackages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Tổng đăng ký</p>
                  <p className="text-2xl font-bold">{statistics.totalRegistrations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-600">Gói phổ biến nhất</p>
                  <p className="text-sm font-semibold">
                    {statistics.packageRegistrationStats.length > 0
                      ? statistics.packageRegistrationStats.reduce((prev, current) =>
                        prev.registrationCount > current.registrationCount ? prev : current
                      ).name
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Tên gói..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="isActive">Trạng thái</Label>
              <Select
                value={filters.isActive === undefined ? '__all__' : filters.isActive.toString()}
                onValueChange={(value) =>
                  handleFilterChange('isActive', value === '__all__' ? undefined : value === 'true')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tất cả trạng thái</SelectItem>
                  <SelectItem value="true">Đang hoạt động</SelectItem>
                  <SelectItem value="false">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="limit">Hiển thị</Label>
              <Select
                value={filters.limit?.toString()}
                onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIMIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách gói đăng ký</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Có lỗi xảy ra khi tải dữ liệu
            </div>
          ) : !packagesData?.data.length ? (
            <div className="text-center py-8 text-gray-500">
              Không có gói đăng ký nào
            </div>
          ) : (
            <div className="space-y-4">
              {packagesData.data.map((pkg) => (
                <Card key={pkg.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{pkg.name}</h3>
                          {pkg.nameEn && (
                            <span className="text-sm text-gray-500">({pkg.nameEn})</span>
                          )}
                          <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                            {pkg.isActive ? 'Hoạt động' : 'Ngừng'}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                        </p>
                        {pkg.description && (
                          <p className="text-gray-600 text-sm">{pkg.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Thứ tự: {pkg.displayOrder}</span>
                          {pkg.maxRegistrations && (
                            <span>Giới hạn: {pkg.maxRegistrations} người</span>
                          )}
                          {pkg._count && (
                            <span>Đã đăng ký: {pkg._count.registrations} người</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(pkg)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4 mr-1" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa gói "{pkg.name}"? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(pkg.id)}
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

              {/* Pagination */}
              {packagesData.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={packagesData.pagination.page <= 1}
                    onClick={() => handleFilterChange('page', packagesData.pagination.page - 1)}
                  >
                    Trước
                  </Button>
                  <span className="flex items-center px-3">
                    Trang {packagesData.pagination.page} / {packagesData.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={packagesData.pagination.page >= packagesData.pagination.totalPages}
                    onClick={() => handleFilterChange('page', packagesData.pagination.page + 1)}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <PackageDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
        title="Tạo gói đăng ký mới"
      />

      {/* Edit Dialog */}
      <PackageDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={(data) => editingPackage && updateMutation.mutate({ id: editingPackage.id, data })}
        isLoading={updateMutation.isPending}
        title="Chỉnh sửa gói đăng ký"
        initialData={editingPackage}
      />
    </div>
  );
}

// Package Form Dialog Component
interface PackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSingerPackageDto) => void;
  isLoading: boolean;
  title: string;
  initialData?: SingerPackage | null;
}

function PackageDialog({ open, onOpenChange, onSubmit, isLoading, title, initialData }: PackageDialogProps) {
  const [formData, setFormData] = useState<CreateSingerPackageDto>({
    name: '',
    nameEn: '',
    price: 0,
    description: '',
    benefits: [],
    colorCode: '',
    icon: '',
    displayOrder: 0,
    maxRegistrations: undefined,
    isActive: true,
  });

  const [benefitsText, setBenefitsText] = useState('');

  // Update form when initialData changes
  useState(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        nameEn: initialData.nameEn || '',
        price: initialData.price,
        description: initialData.description || '',
        benefits: initialData.benefits || [],
        colorCode: initialData.colorCode || '',
        icon: initialData.icon || '',
        displayOrder: initialData.displayOrder,
        maxRegistrations: initialData.maxRegistrations || undefined,
        isActive: initialData.isActive,
      });
      setBenefitsText((initialData.benefits || []).join('\n'));
    } else {
      setFormData({
        name: '',
        nameEn: '',
        price: 0,
        description: '',
        benefits: [],
        colorCode: '',
        icon: '',
        displayOrder: 0,
        maxRegistrations: undefined,
        isActive: true,
      });
      setBenefitsText('');
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const benefits = benefitsText.split('\n').filter(b => b.trim()).map(b => b.trim());
    onSubmit({
      ...formData,
      benefits: benefits.length > 0 ? benefits : undefined,
      nameEn: formData.nameEn || undefined,
      description: formData.description || undefined,
      colorCode: formData.colorCode || undefined,
      icon: formData.icon || undefined,
      maxRegistrations: formData.maxRegistrations || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Chỉnh sửa thông tin gói đăng ký' : 'Tạo gói đăng ký mới cho chương trình ca sĩ'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Tên gói *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="nameEn">Tên tiếng Anh</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Giá (VNĐ) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                required
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

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="benefits">Quyền lợi (mỗi dòng một quyền lợi)</Label>
            <Textarea
              id="benefits"
              value={benefitsText}
              onChange={(e) => setBenefitsText(e.target.value)}
              rows={5}
              placeholder="Ví dụ:&#10;Thanh nhạc cơ bản&#10;Kỹ thuật biểu diễn&#10;Biểu diễn tại 2 đêm nhạc"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="colorCode">Mã màu</Label>
              <Input
                id="colorCode"
                value={formData.colorCode}
                onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                placeholder="#3B82F6"
              />
            </div>
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="star, users, crown"
              />
            </div>
            <div>
              <Label htmlFor="maxRegistrations">Giới hạn đăng ký</Label>
              <Input
                id="maxRegistrations"
                type="number"
                min="1"
                value={formData.maxRegistrations || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxRegistrations: e.target.value ? Number(e.target.value) : undefined
                }))}
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