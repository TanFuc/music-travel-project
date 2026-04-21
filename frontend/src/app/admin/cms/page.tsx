'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, post, del } from '@/lib/api';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';
interface SystemConfig {
  id: number;
  key: string;
  value: any;
  type: string;
  description: string;
  updatedAt: string;
}
export default function AdminCmsPage() {
  usePageTitle();
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({ key: '', value: '', type: 'TEXT', description: '' });
  const { data: configs, isLoading } = useQuery({
    queryKey: ['system-configs'],
    queryFn: () => get<SystemConfig[]>('/system-configs'),
  });
  const upsertMutation = useMutation({
    mutationFn: (data: any) => post('/system-configs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-configs'] });
      toast.success('Lưu cấu hình thành công!');
      setEditingKey(null);
      setFormData({ key: '', value: '', type: 'TEXT', description: '' });
    },
    onError: () => toast.error('Lỗi khi lưu cấu hình'),
  });
  const deleteMutation = useMutation({
    mutationFn: (key: string) => del(`/system-configs/${key}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-configs'] });
      toast.success('Xóa cấu hình thành công!');
    },
  });
  const handleEdit = (config: SystemConfig) => {
    setEditingKey(config.key);
    setFormData({
      key: config.key,
      value:
        typeof config.value === 'object'
          ? JSON.stringify(config.value, null, 2)
          : String(config.value),
      type: config.type,
      description: config.description || '',
    });
  };
  const handleSave = () => {
    if (!formData.key || !formData.value) return toast.error('Key và Value không được để trống');
    try {
      const parsedValue = formData.type === 'JSON' ? JSON.parse(formData.value) : formData.value;
      upsertMutation.mutate({ ...formData, value: parsedValue });
    } catch (e) {
      toast.error('Value không đúng định dạng JSON hợp lệ');
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dynamic CMS (Hệ thống không Hardcode)</h1>
        <p className="mt-1 text-neutral-600">
          Quản lý toàn bộ text, banner, nội dung hiển thị trên website
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingKey ? 'Cập nhật cấu hình' : 'Thêm cấu hình mới'}</CardTitle>
          <CardDescription>
            Key phải viết hoa và dùng dấu gạch dưới (VD: HERO_BANNER, FOOTER_LINKS)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              placeholder="Key (vd: HOME_TITLE)"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              disabled={!!editingKey}
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="TEXT">Văn bản (TEXT)</option>
              <option value="JSON">Dữ liệu phức hợp (JSON)</option>
              <option value="HTML">Mã HTML (HTML)</option>
              <option value="IMAGE">Đường dẫn ảnh (IMAGE)</option>
            </select>
          </div>
          <Input
            placeholder="Mô tả cấu hình..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            placeholder="Nội dung hiển thị (Nếu là JSON phải viết theo chuẩn object)"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? 'Đang lưu...' : 'Lưu lại'}
            </Button>
            {editingKey && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingKey(null);
                  setFormData({ key: '', value: '', type: 'TEXT', description: '' });
                }}
              >
                Hủy
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách cấu hình đã lưu</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : !configs?.length ? (
            <p className="py-10 text-center text-neutral-500">
              Chưa có dữ liệu. Web sẽ hiển thị fallback default.
            </p>
          ) : (
            <div className="space-y-4">
              {configs.map((c) => (
                <div
                  key={c.key}
                  className="flex items-start justify-between gap-4 rounded-md border p-4"
                >
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-lg font-bold text-primary">
                      {c.key}{' '}
                      <span className="ml-2 rounded-full bg-neutral-200 px-2 py-1 text-xs text-neutral-700">
                        {c.type}
                      </span>
                    </h3>
                    <p className="mb-2 text-sm text-neutral-500">{c.description}</p>
                    <pre className="truncate rounded bg-neutral-50 p-2 text-xs">
                      {typeof c.value === 'object' ? JSON.stringify(c.value) : String(c.value)}
                    </pre>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(c)}>
                      Sửa
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(c.key)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
