'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Search, UserPlus, Shield, Ban, Check, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { get, post, patch, del } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { usePageTitle } from '@/hooks/usePageTitle';
const UserFormModal = dynamic(
  () => import('@/components/admin/UserFormModal').then((mod) => ({ default: mod.UserFormModal })),
  {
    loading: () => null,
    ssr: false,
  }
);
interface User {
  id: number;
  phoneNumber: string;
  fullName: string;
  email: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}
interface UsersResponse {
  items: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
const roleColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> =
  {
    ADMIN: 'destructive',
    STAFF: 'warning',
    USER: 'default',
    PARTNER: 'secondary',
  };
export default function AdminUsersPage() {
  usePageTitle();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (search) params.append('search', search);
      const result = await get<UsersResponse>(`/admin/users?${params.toString()}`);
      return result;
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
  const createMutation = useMutation({
    mutationFn: (data: any) => post('/admin/users', data),
    onSuccess: () => {
      toast.success('Tạo người dùng thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => patch(`/admin/users/${id}`, data),
    onSuccess: () => {
      toast.success('Cập nhật thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsFormOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/admin/users/${id}`),
    onSuccess: () => {
      toast.success('Xóa người dùng thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    },
  });
  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => patch(`/admin/users/${id}/toggle-status`, {}),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    },
  });
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };
  const handleFormSubmit = async (formData: any) => {
    if (selectedUser) {
      await updateMutation.mutateAsync({ id: selectedUser.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };
  const handleDeleteConfirm = () => {
    if (deleteUser) {
      deleteMutation.mutate(deleteUser.id);
    }
  };
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mb-4 text-error-500">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Không thể tải dữ liệu</h3>
            <p className="mb-4 text-neutral-600">
              {(error as Error).message || 'Đã xảy ra lỗi khi tải danh sách người dùng'}
            </p>
            <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-800 sm:text-2xl">Quản lý người dùng</h1>
            <p className="mt-1 text-sm text-neutral-600 sm:text-base">
              {data?.meta?.total || 0} người dùng
            </p>
          </div>
          <Button className="w-full gap-2 sm:w-auto" onClick={handleCreateUser}>
            <UserPlus className="h-4 w-4" />
            <span className="sm:inline">Thêm người dùng</span>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, số điện thoại, email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
              <Button onClick={handleSearch} className="w-full sm:w-auto">
                Tìm kiếm
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !data?.items || data.items.length === 0 ? (
              <div className="py-12 text-center text-neutral-500">
                {search ? 'Không tìm thấy người dùng nào.' : 'Chưa có người dùng nào.'}
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">
                          Người dùng
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">
                          Liên hệ
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">
                          Vai trò
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">
                          Trạng thái
                        </th>
                        <th className="hidden px-4 py-3 text-left text-sm font-semibold text-neutral-600 lg:table-cell">
                          Ngày tạo
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b transition-colors hover:bg-neutral-50"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100">
                                <span className="font-semibold text-brand-600">
                                  {user.fullName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-neutral-800">{user.fullName}</p>
                                <p className="text-xs text-neutral-500">ID: {user.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="text-sm text-neutral-800">{user.phoneNumber}</p>
                              {user.email && (
                                <p className="max-w-[200px] truncate text-sm text-neutral-500">
                                  {user.email}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant={roleColors[user.role]} className="gap-1">
                              <Shield className="h-3 w-3" />
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => toggleStatusMutation.mutate(user.id)}
                              disabled={toggleStatusMutation.isPending}
                            >
                              {user.isActive ? (
                                <Badge
                                  variant="success"
                                  className="cursor-pointer gap-1 hover:opacity-80"
                                >
                                  <Check className="h-3 w-3" />
                                  Hoạt động
                                </Badge>
                              ) : (
                                <Badge
                                  variant="destructive"
                                  className="cursor-pointer gap-1 hover:opacity-80"
                                >
                                  <Ban className="h-3 w-3" />
                                  Bị khóa
                                </Badge>
                              )}
                            </button>
                          </td>
                          <td className="hidden px-4 py-4 text-sm text-neutral-600 lg:table-cell">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditUser(user)}
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteUser(user)}
                                title="Xóa"
                                className="hover:text-error-700 hover:bg-error-50 text-error-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {data.items.map((user) => (
                    <div
                      key={user.id}
                      className="space-y-4 rounded-lg border bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100">
                            <span className="text-lg font-semibold text-brand-600">
                              {user.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-800">{user.fullName}</p>
                            <p className="text-xs text-neutral-500">ID: {user.id}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4 text-neutral-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-error-600"
                            onClick={() => setDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="col-span-2">
                          <p className="text-xs text-neutral-500">Liên hệ</p>
                          <p className="font-medium">{user.phoneNumber}</p>
                          <p className="text-neutral-600">{user.email || 'None'}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-neutral-500">Vai trò</p>
                          <Badge variant={roleColors[user.role]} className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-neutral-500">Trạng thái</p>
                          <button
                            onClick={() => toggleStatusMutation.mutate(user.id)}
                            disabled={toggleStatusMutation.isPending}
                            className="touch-manipulation"
                          >
                            {user.isActive ? (
                              <Badge variant="success" className="text-xs">
                                Hoạt động
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                Bị khóa
                              </Badge>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="border-t pt-2 text-xs text-neutral-400">
                        Đăng ký: {formatDate(user.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>

                {data.meta.totalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
                    <p className="order-2 text-sm text-neutral-600 sm:order-1">
                      Trang {data.meta.page} / {data.meta.totalPages} ({data.meta.total} người dùng)
                    </p>
                    <div className="order-1 flex w-full justify-center gap-2 sm:order-2 sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex-1 sm:flex-none"
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                        disabled={page === data.meta.totalPages}
                        className="flex-1 sm:flex-none"
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={
          selectedUser
            ? {
                ...selectedUser,
                email: selectedUser.email || undefined,
                role: selectedUser.role as 'USER' | 'STAFF' | 'ADMIN' | 'PARTNER',
              }
            : undefined
        }
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa người dùng "${deleteUser?.fullName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
