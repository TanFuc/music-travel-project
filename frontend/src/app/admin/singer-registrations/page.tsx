'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Music,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Package,
  Star,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { singerService, type SingerRegistration, type SingerRegistrationFilter } from '@/services/singer.service';
import { singerPackageService } from '@/services/singer-packages.service';
import { getSingingExperienceLabel, getPackageLabel, getPackagePrice } from '@/lib/validations/singer-registration.schema';
import {
  STATUS_FILTER_OPTIONS,
  EXPERIENCE_FILTER_OPTIONS,
  LIMIT_OPTIONS,
  STATUS_UPDATE_OPTIONS,
} from '@/constants/singer';

export default function SingerRegistrationsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SingerRegistrationFilter>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    package: '',
    packageTemplateId: '',
    singingExperience: ''
  });
  const [selectedRegistration, setSelectedRegistration] = useState<SingerRegistration | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', adminNotes: '' });

  // Fetch registrations
  const { data: registrationsData, isLoading } = useQuery({
    queryKey: ['singer-registrations', filters],
    queryFn: () => singerService.getAll(filters)
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['singer-statistics'],
    queryFn: () => singerService.getStatistics()
  });

  // Fetch active packages for filter
  const { data: activePackages } = useQuery({
    queryKey: ['singer-packages-active'],
    queryFn: singerPackageService.getActivePackages,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) =>
      singerService.updateStatus(id, status, adminNotes),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công');
      queryClient.invalidateQueries({ queryKey: ['singer-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['singer-statistics'] });
      setIsStatusModalOpen(false);
      setSelectedRegistration(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => singerService.delete(id),
    onSuccess: () => {
      toast.success('Xóa đăng ký thành công');
      queryClient.invalidateQueries({ queryKey: ['singer-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['singer-statistics'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  });

  const handleFilterChange = (key: keyof SingerRegistrationFilter, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  const handleViewDetails = (registration: SingerRegistration) => {
    setSelectedRegistration(registration);
    setIsViewModalOpen(true);
  };

  const handleStatusUpdate = (registration: SingerRegistration) => {
    setSelectedRegistration(registration);
    setStatusUpdate({ status: registration.status, adminNotes: registration.adminNotes || '' });
    setIsStatusModalOpen(true);
  };

  const handleSubmitStatusUpdate = () => {
    if (!selectedRegistration) return;
    updateStatusMutation.mutate({
      id: selectedRegistration.id,
      status: statusUpdate.status,
      adminNotes: statusUpdate.adminNotes
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      APPROVED: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      REJECTED: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      CANCELLED: { variant: 'outline' as const, icon: XCircle, color: 'text-gray-600' }
    };

    const config = variants[status as keyof typeof variants];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status === 'PENDING' && 'Chờ duyệt'}
        {status === 'APPROVED' && 'Đã duyệt'}
        {status === 'REJECTED' && 'Từ chối'}
        {status === 'CANCELLED' && 'Đã hủy'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đăng ký ca sĩ</h1>
          <p className="text-gray-600">Quản lý các đơn đăng ký tham gia chương trình ca sĩ</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Xuất Excel
        </Button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Music className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Tổng đăng ký</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Chờ duyệt</p>
                  <p className="text-2xl font-bold">{statistics.byStatus.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Đã duyệt</p>
                  <p className="text-2xl font-bold">{statistics.byStatus.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Từ chối</p>
                  <p className="text-2xl font-bold">{statistics.byStatus.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Tên, SĐT, email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={filters.status || '__all__'}
                onValueChange={(value) =>
                  handleFilterChange('status', value === '__all__' ? '' : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* <div>
              <Label htmlFor="package">Gói đăng ký (Legacy)</Label>
              <Select
                value={filters.package || '__all__'}
                onValueChange={(value) =>
                  handleFilterChange('package', value === '__all__' ? '' : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả gói legacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tất cả gói legacy</SelectItem>
                  <SelectItem value="BM_V1">Gói Bm-V1</SelectItem>
                  <SelectItem value="BM_V2">Gói Bm-V2</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div>
              <Label htmlFor="packageTemplate">Gói đăng ký</Label>
              <Select
                value={filters.packageTemplateId || '__all__'}
                onValueChange={(value) =>
                  handleFilterChange('packageTemplateId', value === '__all__' ? '' : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả gói mới" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tất cả gói mới</SelectItem>
                  {activePackages?.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="experience">Kinh nghiệm</Label>
              <Select
                value={filters.singingExperience || '__all__'}
                onValueChange={(value) =>
                  handleFilterChange('singingExperience', value === '__all__' ? '' : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả mức độ" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đăng ký ({registrationsData?.pagination.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : !registrationsData?.data.length ? (
            <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
          ) : (
            <div className="space-y-4">
              {registrationsData.data.map((registration) => (
                <div key={registration.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{registration.fullName}</h3>
                        {getStatusBadge(registration.status)}
                        <Badge variant="outline" className="text-xs">
                          {registration.package === 'BM_V1' ? 'Gói V1' : 'Gói V2'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {registration.phoneNumber}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {registration.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {registration.age} tuổi, {registration.gender}
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          {getSingingExperienceLabel(registration.singingExperience as any)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          {registration.favoriteGenre}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(registration.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(registration)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(registration)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa đăng ký của {registration.fullName}?
                              Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(registration.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {registrationsData && registrationsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Hiển thị {((filters.page || 1) - 1) * (filters.limit || 10) + 1} - {Math.min((filters.page || 1) * (filters.limit || 10), registrationsData.pagination.total)}
                trong tổng số {registrationsData.pagination.total} kết quả
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(filters.page || 1) <= 1}
                  onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
                >
                  Trước
                </Button>
                <span className="text-sm">
                  Trang {filters.page || 1} / {registrationsData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(filters.page || 1) >= registrationsData.pagination.totalPages}
                  onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đăng ký</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{selectedRegistration.fullName}</h3>
                {getStatusBadge(selectedRegistration.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Số điện thoại</Label>
                  <p>{selectedRegistration.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p>{selectedRegistration.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tuổi</Label>
                  <p>{selectedRegistration.age}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Giới tính</Label>
                  <p>{selectedRegistration.gender}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-600">Địa chỉ</Label>
                  <p>{selectedRegistration.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Kinh nghiệm ca hát</Label>
                  <p>{getSingingExperienceLabel(selectedRegistration.singingExperience as any)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Thể loại yêu thích</Label>
                  <p>{selectedRegistration.favoriteGenre}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Gói đăng ký</Label>
                  <p>{getPackageLabel(selectedRegistration.package as any)} - {getPackagePrice(selectedRegistration.package as any)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Ngày đăng ký</Label>
                  <p>{formatDate(selectedRegistration.createdAt)}</p>
                </div>
              </div>

              {selectedRegistration.introduction && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Giới thiệu bản thân</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedRegistration.introduction}</p>
                </div>
              )}

              {selectedRegistration.voiceSampleUrl && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">File mẫu giọng hát</Label>
                  <div className="mt-1">
                    <audio controls className="w-full">
                      <source src={selectedRegistration.voiceSampleUrl} type="audio/mpeg" />
                      Trình duyệt không hỗ trợ phát âm thanh.
                    </audio>
                  </div>
                </div>
              )}

              {selectedRegistration.adminNotes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Ghi chú của admin</Label>
                  <p className="mt-1 p-3 bg-yellow-50 rounded-md">{selectedRegistration.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div>
                <Label>Đăng ký của: {selectedRegistration.fullName}</Label>
              </div>

              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={statusUpdate.status}
                  onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_UPDATE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="adminNotes">Ghi chú của admin</Label>
                <Textarea
                  id="adminNotes"
                  value={statusUpdate.adminNotes}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Nhập ghi chú (tùy chọn)..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmitStatusUpdate}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}