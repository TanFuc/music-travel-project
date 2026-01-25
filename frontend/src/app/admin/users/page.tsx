'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserPlus, MoreVertical, Shield, Ban, Check, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { get, post, patch, del } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

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

const roleColors: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
    ADMIN: 'destructive',
    STAFF: 'warning',
    USER: 'default',
    PARTNER: 'secondary',
};

export default function AdminUsersPage() {
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
        staleTime: 2 * 60 * 1000, // 2 minutes cache
        placeholderData: (previousData) => previousData, // Keep previous data while loading new
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
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <div className="text-error-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Không thể tải dữ liệu</h3>
                        <p className="text-neutral-600 mb-4">
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
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Quản lý người dùng</h1>
                        <p className="text-sm sm:text-base text-neutral-600 mt-1">
                            {data?.meta?.total || 0} người dùng
                        </p>
                    </div>
                    <Button className="gap-2 w-full sm:w-auto" onClick={handleCreateUser}>
                        <UserPlus className="h-4 w-4" />
                        <span className="sm:inline">Thêm người dùng</span>
                    </Button>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-4 sm:pt-6">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input
                                    placeholder="Tìm kiếm theo tên, số điện thoại, email..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10 text-sm sm:text-base"
                                />
                            </div>
                            <Button onClick={handleSearch} className="w-full sm:w-auto">Tìm kiếm</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Users List - Responsive */}
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
                            <div className="text-center py-12 text-neutral-500">
                                {search ? 'Không tìm thấy người dùng nào.' : 'Chưa có người dùng nào.'}
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-600">Người dùng</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-600">Liên hệ</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-600">Vai trò</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-600">Trạng thái</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-600 hidden lg:table-cell">Ngày tạo</th>
                                                <th className="text-right py-3 px-4 font-semibold text-sm text-neutral-600">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.items.map((user) => (
                                                <tr key={user.id} className="border-b hover:bg-neutral-50 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-brand-600 font-semibold">
                                                                    {user.fullName.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-neutral-800">{user.fullName}</p>
                                                                <p className="text-xs text-neutral-500">ID: {user.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div>
                                                            <p className="text-sm text-neutral-800">{user.phoneNumber}</p>
                                                            {user.email && (
                                                                <p className="text-sm text-neutral-500 truncate max-w-[200px]">{user.email}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <Badge variant={roleColors[user.role]} className="gap-1">
                                                            <Shield className="h-3 w-3" />
                                                            {user.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <button
                                                            onClick={() => toggleStatusMutation.mutate(user.id)}
                                                            disabled={toggleStatusMutation.isPending}
                                                        >
                                                            {user.isActive ? (
                                                                <Badge variant="success" className="gap-1 cursor-pointer hover:opacity-80">
                                                                    <Check className="h-3 w-3" />
                                                                    Hoạt động
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="destructive" className="gap-1 cursor-pointer hover:opacity-80">
                                                                    <Ban className="h-3 w-3" />
                                                                    Bị khóa
                                                                </Badge>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-neutral-600 hidden lg:table-cell">
                                                        {formatDate(user.createdAt)}
                                                    </td>
                                                    <td className="py-4 px-4">
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
                                                                className="text-error-600 hover:text-error-700 hover:bg-error-50"
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

                                {/* Mobile Card View */}
                                <div className="grid grid-cols-1 gap-4 md:hidden">
                                    {data.items.map((user) => (
                                        <div key={user.id} className="bg-white border rounded-lg p-4 space-y-4 shadow-sm">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-brand-600 font-semibold text-lg">
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
                                                    <p className="text-neutral-500 text-xs">Liên hệ</p>
                                                    <p className="font-medium">{user.phoneNumber}</p>
                                                    <p className="text-neutral-600">{user.email || 'None'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-neutral-500 text-xs mb-1">Vai trò</p>
                                                    <Badge variant={roleColors[user.role]} className="text-xs">
                                                        {user.role}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="text-neutral-500 text-xs mb-1">Trạng thái</p>
                                                    <button
                                                        onClick={() => toggleStatusMutation.mutate(user.id)}
                                                        disabled={toggleStatusMutation.isPending}
                                                        className="touch-manipulation"
                                                    >
                                                        {user.isActive ? (
                                                            <Badge variant="success" className="text-xs">Hoạt động</Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="text-xs">Bị khóa</Badge>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t text-xs text-neutral-400">
                                                Đăng ký: {formatDate(user.createdAt)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {data.meta.totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t gap-4">
                                        <p className="text-sm text-neutral-600 order-2 sm:order-1">
                                            Trang {data.meta.page} / {data.meta.totalPages} ({data.meta.total} người dùng)
                                        </p>
                                        <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="flex-1 sm:flex-none"
                                            >
                                                Trước
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
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

            {/* Form Modal */}
            <UserFormModal
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedUser(null);
                }}
                onSubmit={handleFormSubmit}
                initialData={selectedUser ? {
                    ...selectedUser,
                    email: selectedUser.email || undefined,
                    role: selectedUser.role as 'USER' | 'STAFF' | 'ADMIN' | 'PARTNER'
                } : undefined}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Confirmation */}
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
