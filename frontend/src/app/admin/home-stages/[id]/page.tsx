'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from '@/components/common/Link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { get, put } from '@/lib/api';
import { toast } from 'sonner';
import Image from 'next/image';

const formSchema = z.object({
    title: z.string().min(3, 'Tên phải có ít nhất 3 ký tự'),
    imageUrl: z.string().url('URL hình ảnh không hợp lệ'),
    description: z.string().optional(),
    location: z.string().optional(),
    isActive: z.boolean(),
    displayOrder: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

interface HomeStage {
    id: number;
    title: string;
    imageUrl: string;
    description?: string;
    location?: string;
    isActive: boolean;
    displayOrder: number;
}

export default function EditHomeStagePage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: stage, isLoading } = useQuery({
        queryKey: ['admin-home-stage', id],
        queryFn: () => get<HomeStage>(`/home-stages/${id}`),
    });

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            isActive: true,
            displayOrder: 0,
        },
    });

    useEffect(() => {
        if (stage) {
            reset({
                title: stage.title,
                imageUrl: stage.imageUrl,
                description: stage.description || '',
                location: stage.location || '',
                isActive: stage.isActive,
                displayOrder: stage.displayOrder,
            });
        }
    }, [stage, reset]);

    const imageUrl = watch('imageUrl');

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            await put(`/home-stages/${id}`, data);
            toast.success('Cập nhật sân khấu thành công');
            router.push('/admin/home-stages');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật sân khấu');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/home-stages">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Chỉnh sửa Sân khấu</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Thông tin Sân khấu</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Tên sân khấu <span className="text-red-500">*</span></Label>
                            <Input id="title" {...register('title')} placeholder="Ví dụ: Sân khấu Mây Lang Thang" />
                            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">URL Hình ảnh <span className="text-red-500">*</span></Label>
                            <Input id="imageUrl" {...register('imageUrl')} placeholder="https://..." />
                            {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}

                            {imageUrl && !errors.imageUrl && (
                                <div className="mt-2 relative aspect-video w-full max-w-md rounded-lg overflow-hidden border bg-neutral-100">
                                    <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="location">Địa điểm</Label>
                                <Input id="location" {...register('location')} placeholder="Ví dụ: Đà Lạt" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
                                <Input id="displayOrder" type="number" {...register('displayOrder')} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea id="description" {...register('description')} placeholder="Mô tả ngắn về sân khấu..." rows={4} />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg bg-neutral-50">
                            <div className="space-y-0.5">
                                <Label className="text-base">Trạng thái hoạt động</Label>
                                <p className="text-sm text-neutral-500">Hiển thị trên trang chủ</p>
                            </div>
                            <Switch
                                checked={watch('isActive')}
                                onCheckedChange={(checked) => setValue('isActive', checked)}
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Link href="/admin/home-stages">
                                <Button variant="outline" type="button">Hủy</Button>
                            </Link>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Lưu Thay đổi
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
