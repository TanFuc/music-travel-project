'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, put, post } from '@/lib/api';
import { ArrowLeft, Layout } from 'lucide-react';
const SeatMapEditor = dynamic(
  () => import('@/components/admin/SeatMapEditor').then((mod) => ({ default: mod.SeatMapEditor })),
  {
    loading: () => (
      <Card>
        <CardContent className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);
interface Stage {
  id: number;
  name: string;
  locationId: number;
  seatMapConfig: any;
  seatMapTemplate: number | null;
  template?: {
    id: number;
    name: string;
    description: string;
  };
}
interface Template {
  id: number;
  name: string;
  description: string;
  config: any;
  isPublic: boolean;
}
export default function StageSeatMapPage() {
  const params = useParams();
  const router = useRouter();
  const stageId = Number(params.stageId);
  const [stage, setStage] = useState<Stage | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [stageData, templatesData, presetsData] = await Promise.all([
        get<any>(`/seat-maps/stages/${stageId}`),
        get<Template[]>('/seat-maps/templates'),
        get<any[]>('/seat-maps/templates/presets'),
      ]);
      setStage(stageData.stage);
      setTemplates(templatesData);
      setPresets(presetsData);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [stageId]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  const handleSaveConfig = async (config: any) => {
    try {
      setSaving(true);
      await put(`/seat-maps/stages/${stageId}`, {
        seatMapConfig: config,
      });
      alert('Đã lưu cấu hình sơ đồ chỗ ngồi!');
      await loadData();
    } catch {
      alert('Lỗi khi lưu cấu hình!');
    } finally {
      setSaving(false);
    }
  };
  const handleApplyTemplate = async (templateId: number) => {
    try {
      setSaving(true);
      await post(`/seat-maps/stages/${stageId}/apply-template`, {
        templateId,
      });
      alert('Đã áp dụng template!');
      await loadData();
    } catch {
      alert('Lỗi khi áp dụng template!');
    } finally {
      setSaving(false);
    }
  };
  const handleApplyPreset = async (preset: any) => {
    if (!confirm(`Áp dụng preset "${preset.name}"?`)) return;
    try {
      setSaving(true);
      await put(`/seat-maps/stages/${stageId}`, {
        seatMapConfig: preset.config,
      });
      alert('Đã áp dụng preset!');
      await loadData();
    } catch {
      alert('Lỗi khi áp dụng preset!');
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }
  if (!stage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">Không tìm thấy sân khấu</div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Sơ Đồ Chỗ Ngồi</h1>
            <p className="text-gray-600">
              {stage.name}
              {stage.template && (
                <Badge className="ml-2" variant="secondary">
                  <Layout className="mr-1 h-3 w-3" />
                  {stage.template.name}
                </Badge>
              )}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList>
          <TabsTrigger value="editor">Chỉnh Sửa</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          {stage.seatMapConfig ? (
            <SeatMapEditor initialConfig={stage.seatMapConfig} onSave={handleSaveConfig} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Layout className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold">Chưa có sơ đồ chỗ ngồi</h3>
                <p className="mb-6 text-gray-600">
                  Vui lòng chọn một template hoặc preset để bắt đầu
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() =>
                      (document.querySelector('[value="templates"]') as HTMLElement)?.click()
                    }
                  >
                    Chọn Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      (document.querySelector('[value="presets"]') as HTMLElement)?.click()
                    }
                  >
                    Chọn Preset
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Templates Có Sẵn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer transition-shadow hover:shadow-lg"
                  >
                    <CardContent className="p-6">
                      <h3 className="mb-2 text-lg font-semibold">{template.name}</h3>
                      <p className="mb-4 text-sm text-gray-600">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={template.isPublic ? 'default' : 'secondary'}>
                          {template.isPublic ? 'Công khai' : 'Riêng tư'}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleApplyTemplate(template.id)}
                          disabled={saving}
                        >
                          Áp dụng
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {templates.length === 0 && (
                  <div className="col-span-3 py-12 text-center text-gray-500">
                    Chưa có template nào
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preset Mẫu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {presets.map((preset, index) => (
                  <Card key={index} className="cursor-pointer transition-shadow hover:shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="mb-2 text-lg font-semibold">{preset.name}</h3>
                      <p className="mb-4 text-sm text-gray-600">{preset.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {preset.config.zones.length} khu vực
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleApplyPreset(preset)}
                          disabled={saving}
                        >
                          Áp dụng
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
