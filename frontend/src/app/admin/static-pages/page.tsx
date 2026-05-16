'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, post, put, del } from '@/lib/api';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus, Globe, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
interface StaticPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  updatedAt: string;
}
export default function AdminStaticPages() {
  usePageTitle();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [formData, setFormData] = useState<Partial<StaticPage>>({
    title: '',
    slug: '',
    content: '',
    category: 'POLICY',
    isActive: true,
    metaTitle: '',
    metaDescription: '',
  });
  const { data: pages, isLoading } = useQuery({
    queryKey: ['static-pages-admin'],
    queryFn: () => get<StaticPage[]>('/static-pages'),
  });
  const upsertMutation = useMutation({
    mutationFn: (data: any) =>
      data.id ? put(`/static-pages/${data.id}`, data) : post('/static-pages', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-pages-admin'] });
      toast.success('Lưu trang thành công!');
      setIsEditing(false);
      resetForm();
    },
    onError: (error: any) => toast.error(error.message || 'Lỗi khi lưu trang'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/static-pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-pages-admin'] });
      toast.success('Xóa trang thành công!');
    },
  });
  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      category: 'POLICY',
      isActive: true,
      metaTitle: '',
      metaDescription: '',
    });
  };
  const handleEdit = (page: StaticPage) => {
    setFormData(page);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleSave = () => {
    if (!formData.title || !formData.slug)
      return toast.error('Tiêu đề và Slug không được để trống');
    upsertMutation.mutate(formData);
  };
  const filteredPages = pages?.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const categories = ['POLICY', 'SUPPORT', 'OTHER'];
  if (isLoading)
    return (
      <div className="p-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Quản lý Trang Tĩnh</h1>
          <p className="mt-1 text-neutral-500">
            Quản lý nội dung các trang điều khoản, chính sách, hướng dẫn...
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditing(true);
            resetForm();
          }}
          className="rounded-full bg-brand-600 px-6 hover:bg-brand-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Tạo trang mới
        </Button>
      </div>

      {isEditing && (
        <Card className="border-brand-100 shadow-lg">
          <CardHeader className="bg-brand-50/50">
            <CardTitle>{formData.id ? 'Cập nhật trang' : 'Tạo trang mới'}</CardTitle>
            <CardDescription>Cập nhật nội dung và cấu hình SEO cho trang</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Tiêu đề trang</label>
                <Input
                  placeholder="VD: Điều khoản dịch vụ"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^\w\s-]/g, '')
                      .replace(/[\s+]/g, '-');
                    setFormData({ ...formData, title, slug: formData.id ? formData.slug : slug });
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Slug (URL)</label>
                <Input
                  placeholder="vd: dieu-khoan-dich-vu"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Danh mục</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Hiển thị công khai
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nội dung (HTML/Rich Text)</label>
              <textarea
                className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                placeholder="Nhập nội dung trang tại đây..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="rounded-xl border border-dashed border-gray-200 p-6">
              <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-gray-400">
                Cấu hình SEO
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Meta Title</label>
                  <Input
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Meta Description</label>
                  <Input
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  resetForm();
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSave}
                disabled={upsertMutation.isPending}
                className="bg-brand-600 hover:bg-brand-700"
              >
                {upsertMutation.isPending ? 'Đang xử lý...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex-1 space-y-1">
            <CardTitle>Danh sách trang</CardTitle>
            <CardDescription>Tìm thấy {filteredPages?.length} trang</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm..."
                className="w-64 rounded-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 rounded-full border bg-gray-50 px-3 py-1">
              <Filter className="h-3.5 w-3.5 text-gray-400" />
              <select
                className="border-none bg-transparent text-sm focus:ring-0"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-bold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Trang</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPages?.map((page) => (
                  <tr key={page.id} className="group hover:bg-neutral-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{page.title}</div>
                      <div className="text-xs text-gray-400">
                        Cập nhật: {new Date(page.updatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-brand-600">
                        /p/{page.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-white">
                        {page.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {page.isActive ? (
                        <span className="flex items-center gap-1.5 text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-gray-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                          Ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                            <Globe className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600"
                          onClick={() => handleEdit(page)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600"
                          onClick={() => {
                            if (confirm('Bạn có chắc chắn muốn xóa trang này?'))
                              deleteMutation.mutate(page.id);
                          }}
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
          {!filteredPages?.length && (
            <div className="py-20 text-center">
              <p className="text-neutral-500">Không tìm thấy trang nào khớp với yêu cầu.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
