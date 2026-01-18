'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Theater, MapPin, Layout, Plus, Users, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { StageFormModal } from '@/components/admin/StageFormModal';
import { stageService, Stage } from '@/services/stage.service';

export default function AdminStagesPage() {
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<number | undefined>();

  const { data: stages, isLoading } = useQuery({
    queryKey: ['admin-stages', page],
    queryFn: () => stageService.getStages(),
  });

  const handleEdit = (stageId: number) => {
    setSelectedStageId(stageId);
    setIsFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setSelectedStageId(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sân khấu</h1>
          <p className="text-neutral-600 mt-1">{stages?.length || 0} sân khấu</p>
        </div>
        <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Tạo sân khấu mới
        </Button>
      </div>

      <StageFormModal
        isOpen={isFormOpen}
        onClose={handleCloseModal}
        stageId={selectedStageId}
      />

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sân khấu</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !stages?.length ? (
            <div className="text-center py-12 text-neutral-500">Chưa có sân khấu nào.</div>
          ) : (
            <div className="space-y-4">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="border rounded-lg p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Theater className="h-5 w-5 text-brand-600" />
                        <h3 className="font-semibold text-lg">{stage.name}</h3>
                        {stage.seatMapConfig ? (
                          <Badge variant="success">Đã cấu hình sơ đồ</Badge>
                        ) : (
                          <Badge variant="secondary">Chưa có sơ đồ</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {stage.location.name}
                        </div>
                        {stage.seatMapConfig && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {(stage.seatMapConfig as any).zones?.reduce(
                              (sum: number, z: any) => sum + z.rows * z.seatsPerRow,
                              0
                            ) || 0}{' '}
                            chỗ ngồi
                          </div>
                        )}
                      </div>
                      {stage.address && (
                        <p className="text-sm text-neutral-500 mt-2">{stage.address}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(stage.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Link href={`/admin/stages/${stage.id}/seat-map`}>
                        <Button variant="outline" size="sm">
                          <Layout className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
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
