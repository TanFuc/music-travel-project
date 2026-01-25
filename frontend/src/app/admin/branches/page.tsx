'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { branchService } from '@/services/branch.service';
import { post, put, del } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminBranchesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();

  const { data: branches, isLoading } = useQuery({
    queryKey: ['admin-branches'],
    queryFn: () => branchService.getBranches(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (editingBranch) {
        return put(`/admin/branches/${editingBranch.id}`, data);
      }
      return post('/admin/branches', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
      toast.success(editingBranch ? 'Cập nhật thành công' : 'Tạo mới thành công');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/admin/branches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
      toast.success('Đã xóa chi nhánh');
    },
  });

  const handleEdit = (branch: any) => {
    setEditingBranch(branch);
    setFormData({ name: branch.name, description: branch.description || '' });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Quản lý chi nhánh</h1>
          <p className="text-neutral-600 italic">Quản lý các chi nhánh/điểm hoạt động trên toàn hệ thống</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm chi nhánh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chi nhánh</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : !branches?.length ? (
            <div className="text-center py-12 text-neutral-500">Chưa có chi nhánh nào.</div>
          ) : (
            <div className="grid gap-4">
              {branches.map((branch: any) => (
                <div key={branch.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{branch.name}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-1">{branch.description || 'Không có mô tả'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(branch)}>
                      <Edit className="h-4 w-4 text-neutral-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn xóa chi nhánh này?')) {
                          deleteMutation.mutate(branch.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle>{editingBranch ? 'Cập nhật chi nhánh' : 'Thêm chi nhánh mới'}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên chi nhánh *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Chi nhánh Đà Lạt"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Thông tin thêm về chi nhánh..."
                    rows={4}
                  />
                </div>
              </CardContent>
              <div className="flex gap-2 p-6 border-t">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Hủy
                </Button>
                <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Đang xử lý...' : (editingBranch ? 'Cập nhật' : 'Tạo mới')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
