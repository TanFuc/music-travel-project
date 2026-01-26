'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/common/ImageUpload';

interface UserFormData {
    phoneNumber: string;
    fullName: string;
    email?: string;
    password?: string;
    avatarUrl?: string;
    role: 'USER' | 'STAFF' | 'ADMIN' | 'PARTNER';
}

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => Promise<void>;
    initialData?: Partial<UserFormData> & { id?: number };
    isLoading?: boolean;
}

export function UserFormModal({ isOpen, onClose, onSubmit, initialData, isLoading }: UserFormModalProps) {
    const isEdit = !!initialData?.id;
    const { register, handleSubmit, control, formState: { errors } } = useForm<UserFormData>({
        defaultValues: initialData || { role: 'USER' },
    });

    if (!isOpen) return null;

    const onFormSubmit = async (data: UserFormData) => {
        await onSubmit(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                        {/* Phone Number */}
                        <div>
                            <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                            <Input
                                id="phoneNumber"
                                {...register('phoneNumber', { required: 'Số điện thoại là bắt buộc' })}
                                placeholder="0901234567"
                                disabled={isEdit || isLoading}
                            />
                            {errors.phoneNumber && (
                                <p className="text-sm text-error-500 mt-1">{errors.phoneNumber.message}</p>
                            )}
                        </div>

                        {/* Avatar */}
                        <div>
                            <Label>Ảnh đại diện</Label>
                            <Controller
                                name="avatarUrl"
                                control={control}
                                render={({ field }) => (
                                    <ImageUpload
                                        value={field.value}
                                        onChange={field.onChange}
                                        folder="avatars"
                                        aspectRatio="square"
                                        className="mt-2 w-32 mx-auto"
                                    />
                                )}
                            />
                        </div>

                        {/* Full Name */}
                        <div>
                            <Label htmlFor="fullName">Họ và tên *</Label>
                            <Input
                                id="fullName"
                                {...register('fullName', { required: 'Họ tên là bắt buộc' })}
                                placeholder="Nguyễn Văn A"
                                disabled={isLoading}
                            />
                            {errors.fullName && (
                                <p className="text-sm text-error-500 mt-1">{errors.fullName.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                placeholder="email@example.com"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password (only for create) */}
                        {!isEdit && (
                            <div>
                                <Label htmlFor="password">Mật khẩu *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password', { required: !isEdit && 'Mật khẩu là bắt buộc', minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' } })}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                {errors.password && (
                                    <p className="text-sm text-error-500 mt-1">{errors.password.message}</p>
                                )}
                            </div>
                        )}

                        {/* Role */}
                        <div>
                            <Label htmlFor="role">Vai trò *</Label>
                            <select
                                id="role"
                                {...register('role', { required: 'Vai trò là bắt buộc' })}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                disabled={isLoading}
                            >
                                <option value="USER">Người dùng</option>
                                <option value="STAFF">Nhân viên</option>
                                <option value="ADMIN">Quản trị viên</option>
                                <option value="PARTNER">Đối tác</option>
                            </select>
                            {errors.role && (
                                <p className="text-sm text-error-500 mt-1">{errors.role.message}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
                                Hủy
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isLoading}>
                                {isLoading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
