'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, MapPin, Monitor } from 'lucide-react';
import { Link } from '@/components/common/Link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, del } from '@/lib/api';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from 'next/image';

interface HomeStage {
    id: number;
    title: string;
    imageUrl: string;
    description?: string;
    location?: string;
    isActive: boolean;
    displayOrder: number;
}

export default function AdminHomeStagesPage() {
    const queryClient = useQueryClient();
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data: stages, isLoading } = useQuery({
        queryKey: ['admin-home-stages'],
        queryFn: () => get<HomeStage[]>('/home-stages'),
    });

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await del(`/home-stages/${deleteId}`);
            toast.success('Xóa sân khấu thành công');
            queryClient.invalidateQueries({ queryKey: ['admin-home-stages'] });
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa sân khấu');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý Sân khấu (Trang chủ)</h1>
                    <p className="text-neutral-600 mt-1">Quản lý hình ảnh và thông tin sân khấu hiển thị ở trang chủ</p>
                </div>
                <Link href="/admin/home-stages/create">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Thêm Sân khấu
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách Sân khấu</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                        </div>
                    ) : !stages?.length ? (
                        <div className="text-center py-12 text-neutral-500">Chưa có sân khấu nào.</div>
                    ) : (
                        <div className="space-y-4">
                            {stages.map((stage) => (
                                <div key={stage.id} className="border rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                        {/* Image */}
                                        <div className="relative w-40 h-24 bg-neutral-100 rounded-md overflow-hidden border shrink-0">
                                            <Image src={stage.imageUrl} alt={stage.title} fill sizes="160px" className="object-cover" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-lg">{stage.title}</h3>
                                                <Badge variant={stage.isActive ? 'default' : 'secondary'}>
                                                    {stage.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                                                </Badge>
                                            </div>

                                            {stage.location && (
                                                <div className="flex items-center gap-1 text-sm text-neutral-600 mb-2">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{stage.location}</span>
                                                </div>
                                            )}

                                            {stage.description && (
                                                <p className="text-sm text-neutral-600 line-clamp-2">{stage.description}</p>
                                            )}

                                            <div className="mt-2 text-xs text-neutral-500">
                                                Thứ tự hiển thị: {stage.displayOrder}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Link href={`/admin/home-stages/${stage.id}`}>
                                                <Button variant="outline" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(stage.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Sân khấu sẽ tìm thấy vĩnh viễn bị xóa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
