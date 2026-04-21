'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Video, FileImage, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, patch, post } from '@/lib/api';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/common/ImageUpload';
import { toast } from 'sonner';
type MediaTargetType = 'SHOW' | 'TOUR' | 'STAGE' | 'ARTIST';
interface Media {
  id: number;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  targetType: MediaTargetType;
  targetId: number;
  isFeatured: boolean;
}
interface CreateMediaForm {
  url: string;
  type: 'IMAGE' | 'VIDEO';
  targetType: MediaTargetType;
  targetId: number;
  isFeatured: boolean;
}
interface EditMediaForm {
  id: number;
  url: string;
  isFeatured: boolean;
}
const TARGET_TYPES: MediaTargetType[] = ['SHOW', 'TOUR', 'STAGE', 'ARTIST'];
function MediaModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{title}</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
export default function AdminMediaPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateMediaForm>({
    url: '',
    type: 'IMAGE',
    targetType: 'SHOW',
    targetId: 0,
    isFeatured: false,
  });
  const [editForm, setEditForm] = useState<EditMediaForm | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-media', page],
    queryFn: () =>
      get<{
        items: Media[];
        meta: any;
      }>(`/admin/media?page=${page}&limit=20`),
  });
  const createMutation = useMutation({
    mutationFn: (payload: CreateMediaForm) => post('/admin/media', payload),
    onSuccess: () => {
      toast.success('Upload media thành công');
      setShowCreateModal(false);
      setCreateForm({
        url: '',
        type: 'IMAGE',
        targetType: 'SHOW',
        targetId: 0,
        isFeatured: false,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
    },
    onError: () => {
      toast.error('Không thể tạo media');
    },
  });
  const updateMutation = useMutation({
    mutationFn: (payload: EditMediaForm) =>
      patch(`/admin/media/${payload.id}`, {
        url: payload.url,
        isFeatured: payload.isFeatured,
      }),
    onSuccess: () => {
      toast.success('Cập nhật ảnh thành công');
      setEditForm(null);
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
    },
    onError: () => {
      toast.error('Không thể cập nhật media');
    },
  });
  const handleCreateSubmit = () => {
    if (!createForm.url) {
      toast.error('Vui lòng tải ảnh trước');
      return;
    }
    if (!createForm.targetId || Number.isNaN(createForm.targetId)) {
      toast.error('Vui lòng nhập targetId hợp lệ');
      return;
    }
    createMutation.mutate(createForm);
  };
  const handleUpdateSubmit = () => {
    if (!editForm) {
      return;
    }
    if (!editForm.url) {
      toast.error('Vui lòng chọn ảnh hợp lệ');
      return;
    }
    updateMutation.mutate(editForm);
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Quản lý media</h1>
          <p className="mt-1 text-sm text-neutral-600 sm:text-base">
            {data?.meta?.total || 0} files
          </p>
        </div>
        <Button className="w-full gap-2 sm:w-auto" onClick={() => setShowCreateModal(true)}>
          <FileImage className="h-4 w-4" />
          Upload media
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Thư viện media</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          ) : !data?.items?.length ? (
            <div className="py-12 text-center text-neutral-500">Chưa có media nào.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
                {data.items.map((media) => (
                  <div
                    key={media.id}
                    className="group relative aspect-square overflow-hidden rounded-lg border transition-shadow hover:shadow-lg"
                  >
                    {media.type === 'IMAGE' ? (
                      <img src={media.url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-100">
                        <Video className="h-12 w-12 text-neutral-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="space-y-2 p-2 text-center text-white">
                        <Badge variant="secondary" className="mb-2">
                          {media.targetType}
                        </Badge>
                        {media.isFeatured && <Badge variant="warning">Featured</Badge>}
                        <div>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-1"
                            onClick={() =>
                              setEditForm({
                                id: media.id,
                                url: media.url,
                                isFeatured: media.isFeatured,
                              })
                            }
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Sửa ảnh
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {data.meta.totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-center text-xs text-neutral-600 sm:text-left sm:text-sm">
                    Trang {data.meta.page} / {data.meta.totalPages}
                  </p>
                  <div className="flex justify-center gap-2 sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === data.meta.totalPages}
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

      {showCreateModal && (
        <MediaModal title="Upload media mới" onClose={() => setShowCreateModal(false)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ảnh / Media URL</Label>
              <ImageUpload
                value={createForm.url}
                onChange={(url) => setCreateForm((prev) => ({ ...prev, url }))}
                folder={`admin-${createForm.targetType.toLowerCase()}`}
                aspectRatio="video"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={createForm.type}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      type: event.target.value as 'IMAGE' | 'VIDEO',
                    }))
                  }
                >
                  <option value="IMAGE">IMAGE</option>
                  <option value="VIDEO">VIDEO</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetType">Target Type</Label>
                <select
                  id="targetType"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={createForm.targetType}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      targetType: event.target.value as MediaTargetType,
                    }))
                  }
                >
                  {TARGET_TYPES.map((targetType) => (
                    <option key={targetType} value={targetType}>
                      {targetType}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetId">Target ID</Label>
              <Input
                id="targetId"
                type="number"
                value={createForm.targetId || ''}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, targetId: Number(event.target.value || 0) }))
                }
                placeholder="Ví dụ: 12"
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="isFeaturedCreate">Featured</Label>
              <Switch
                id="isFeaturedCreate"
                checked={createForm.isFeatured}
                onCheckedChange={(checked) =>
                  setCreateForm((prev) => ({ ...prev, isFeatured: checked }))
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleCreateSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Đang lưu...' : 'Tạo media'}
              </Button>
            </div>
          </div>
        </MediaModal>
      )}

      {editForm && (
        <MediaModal title={`Cập nhật ảnh media #${editForm.id}`} onClose={() => setEditForm(null)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ảnh media</Label>
              <ImageUpload
                value={editForm.url}
                onChange={(url) => setEditForm((prev) => (prev ? { ...prev, url } : prev))}
                folder="admin-media"
                aspectRatio="video"
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="isFeaturedEdit">Featured</Label>
              <Switch
                id="isFeaturedEdit"
                checked={editForm.isFeatured}
                onCheckedChange={(checked) =>
                  setEditForm((prev) => (prev ? { ...prev, isFeatured: checked } : prev))
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditForm(null)}>
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleUpdateSubmit}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Đang cập nhật...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </div>
        </MediaModal>
      )}
    </div>
  );
}
