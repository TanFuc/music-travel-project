'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Grid3x3, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { stageService, CreateStageDto } from '@/services/stage.service';
import { locationService } from '@/services/location.service';
import { toast } from 'sonner';
interface StageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageId?: number;
}
interface SeatZone {
  name: string;
  rows: number;
  seatsPerRow: number;
  color: string;
}
export function StageFormModal({ isOpen, onClose, stageId }: StageFormModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<CreateStageDto>({
    locationId: 0,
    name: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    mapLink: '',
    seatMapConfig: undefined,
    seatMapTemplate: undefined,
  });
  const [seatZones, setSeatZones] = useState<SeatZone[]>([
    { name: 'VIP', rows: 5, seatsPerRow: 10, color: '#FFD700' },
    { name: 'Regular', rows: 10, seatsPerRow: 15, color: '#87CEEB' },
  ]);
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.getLocations(),
  });
  const createMutation = useMutation({
    mutationFn: (data: CreateStageDto) => stageService.createStage(data),
    onSuccess: () => {
      toast.success('Tạo sân khấu thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-stages'] });
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể tạo sân khấu');
    },
  });
  const updateMutation = useMutation({
    mutationFn: (data: CreateStageDto) => stageService.updateStage(stageId!, data),
    onSuccess: () => {
      toast.success('Cập nhật sân khấu thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-stages'] });
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật sân khấu');
    },
  });
  const resetForm = () => {
    setFormData({
      locationId: 0,
      name: '',
      address: '',
      latitude: undefined,
      longitude: undefined,
      mapLink: '',
      seatMapConfig: undefined,
      seatMapTemplate: undefined,
    });
    setSeatZones([
      { name: 'VIP', rows: 5, seatsPerRow: 10, color: '#FFD700' },
      { name: 'Regular', rows: 10, seatsPerRow: 15, color: '#87CEEB' },
    ]);
    setActiveTab('basic');
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.locationId || !formData.name) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    const seatMapConfig =
      seatZones.length > 0
        ? {
            zones: seatZones.map((zone) => ({
              name: zone.name,
              rows: zone.rows,
              seatsPerRow: zone.seatsPerRow,
              color: zone.color,
            })),
          }
        : undefined;
    const submitData = {
      ...formData,
      seatMapConfig,
    };
    if (stageId) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };
  const addZone = () => {
    setSeatZones([
      ...seatZones,
      { name: `Zone ${seatZones.length + 1}`, rows: 5, seatsPerRow: 10, color: '#CCCCCC' },
    ]);
  };
  const removeZone = (index: number) => {
    setSeatZones(seatZones.filter((_, i) => i !== index));
  };
  const updateZone = (index: number, field: keyof SeatZone, value: any) => {
    const updated = [...seatZones];
    updated[index] = { ...updated[index], [field]: value };
    setSeatZones(updated);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{stageId ? 'Cập nhật' : 'Tạo'} sân khấu</DialogTitle>
          <DialogDescription>
            {stageId ? 'Cập nhật thông tin' : 'Tạo mới'} sân khấu và cấu hình sơ đồ chỗ ngồi
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="seatmap">Sơ đồ chỗ ngồi</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="locationId">
                  Địa điểm <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={String(formData.locationId)}
                  onValueChange={(value) => setFormData({ ...formData, locationId: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map((location) => (
                      <SelectItem key={location.id} value={String(location.id)}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên sân khấu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Nhà hát Hòa Bình"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Vĩ độ (Latitude)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="10.7756"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Kinh độ (Longitude)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="106.7019"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mapLink">Link Google Maps</Label>
                <Input
                  id="mapLink"
                  value={formData.mapLink}
                  onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </TabsContent>

            <TabsContent value="seatmap" className="mt-4 space-y-4">
              <div className="rounded-lg border bg-neutral-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-brand-600" />
                    <h3 className="font-semibold">Cấu hình khu vực</h3>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addZone}>
                    Thêm khu vực
                  </Button>
                </div>

                <div className="space-y-4">
                  {seatZones.map((zone, index) => (
                    <div key={index} className="rounded-lg border bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-medium">Khu vực {index + 1}</h4>
                        {seatZones.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeZone(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Tên khu vực</Label>
                          <Input
                            value={zone.name}
                            onChange={(e) => updateZone(index, 'name', e.target.value)}
                            placeholder="VIP, Regular, etc."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Màu sắc</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={zone.color}
                              onChange={(e) => updateZone(index, 'color', e.target.value)}
                              className="h-10 w-16 p-1"
                            />
                            <Input
                              value={zone.color}
                              onChange={(e) => updateZone(index, 'color', e.target.value)}
                              placeholder="#FFD700"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Số hàng</Label>
                          <Input
                            type="number"
                            min="1"
                            value={zone.rows}
                            onChange={(e) => updateZone(index, 'rows', Number(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Số ghế / hàng</Label>
                          <Input
                            type="number"
                            min="1"
                            value={zone.seatsPerRow}
                            onChange={(e) =>
                              updateZone(index, 'seatsPerRow', Number(e.target.value))
                            }
                          />
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-neutral-600">
                        Tổng: {zone.rows * zone.seatsPerRow} chỗ ngồi
                      </div>
                    </div>
                  ))}
                </div>

                {seatZones.length > 0 && (
                  <div className="mt-4 rounded-lg bg-brand-50 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-brand-900">
                      <Grid3x3 className="h-4 w-4" />
                      Tổng cộng:{' '}
                      {seatZones.reduce((sum, zone) => sum + zone.rows * zone.seatsPerRow, 0)} chỗ
                      ngồi
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-medium">Preview</h4>
                <div className="space-y-2">
                  {seatZones.map((zone, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-4 w-4 rounded" style={{ backgroundColor: zone.color }} />
                      <span className="font-medium">{zone.name}:</span>
                      <span className="text-neutral-600">
                        {zone.rows} hàng × {zone.seatsPerRow} ghế = {zone.rows * zone.seatsPerRow}{' '}
                        chỗ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending
                ? 'Đang xử lý...'
                : stageId
                  ? 'Cập nhật'
                  : 'Tạo sân khấu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
