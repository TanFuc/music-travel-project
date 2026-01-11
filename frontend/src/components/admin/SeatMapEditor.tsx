'use client';

import { useState } from 'react';
import { Stage as KonvaStage, Layer, Rect, Text, Group } from 'react-konva';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Trash2, Copy, Grid, Eye } from 'lucide-react';

interface Seat {
  id: string;
  seatNumber: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status?: 'available' | 'locked' | 'disabled';
}

interface SeatRow {
  id: string;
  rowName: string;
  seats: Seat[];
}

interface SeatZone {
  id: string;
  name: string;
  type: 'SEAT' | 'STANDING';
  color: string;
  rows: SeatRow[];
}

interface SeatMapConfig {
  width: number;
  height: number;
  zones: SeatZone[];
}

interface SeatMapEditorProps {
  initialConfig?: SeatMapConfig;
  onSave: (config: SeatMapConfig) => void;
  readonly?: boolean;
}

const ZONE_COLORS = {
  VIP: '#FFD700',
  Standard: '#4CAF50',
  Standing: '#2196F3',
};

export function SeatMapEditor({ initialConfig, onSave, readonly = false }: SeatMapEditorProps) {
  const [config, setConfig] = useState<SeatMapConfig>(
    initialConfig || {
      width: 1000,
      height: 800,
      zones: [],
    }
  );

  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  // ============================================================================
  // ZONE MANAGEMENT
  // ============================================================================

  const addZone = () => {
    const newZone: SeatZone = {
      id: `zone-${Date.now()}`,
      name: 'New Zone',
      type: 'SEAT',
      color: '#4CAF50',
      rows: [],
    };
    setConfig({ ...config, zones: [...config.zones, newZone] });
  };

  const updateZone = (zoneId: string, updates: Partial<SeatZone>) => {
    setConfig({
      ...config,
      zones: config.zones.map((zone) =>
        zone.id === zoneId ? { ...zone, ...updates } : zone
      ),
    });
  };

  const deleteZone = (zoneId: string) => {
    setConfig({
      ...config,
      zones: config.zones.filter((zone) => zone.id !== zoneId),
    });
    if (selectedZone === zoneId) setSelectedZone(null);
  };

  // ============================================================================
  // ROW MANAGEMENT
  // ============================================================================

  const addRow = (zoneId: string) => {
    const zone = config.zones.find((z) => z.id === zoneId);
    if (!zone) return;

    const rowCount = zone.rows.length;
    const rowName = String.fromCharCode(65 + rowCount); // A, B, C...
    const newRow: SeatRow = {
      id: `row-${Date.now()}`,
      rowName,
      seats: [],
    };

    updateZone(zoneId, {
      rows: [...zone.rows, newRow],
    });
  };

  const addSeatsToRow = (zoneId: string, rowId: string, count: number) => {
    const zone = config.zones.find((z) => z.id === zoneId);
    if (!zone) return;

    const row = zone.rows.find((r) => r.id === rowId);
    if (!row) return;

    const startX = 50;
    const startY = 100 + zone.rows.indexOf(row) * 40;
    const spacing = 40;

    const newSeats: Seat[] = [];
    for (let i = 0; i < count; i++) {
      newSeats.push({
        id: `seat-${Date.now()}-${i}`,
        seatNumber: (row.seats.length + i + 1).toString(),
        x: startX + (row.seats.length + i) * spacing,
        y: startY,
        width: 30,
        height: 30,
        status: 'available',
      });
    }

    const updatedRows = zone.rows.map((r) =>
      r.id === rowId ? { ...r, seats: [...r.seats, ...newSeats] } : r
    );

    updateZone(zoneId, { rows: updatedRows });
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderSeatMap = () => {
    return (
      <KonvaStage width={config.width} height={config.height} className="border rounded-lg bg-gray-50">
        <Layer>
          {/* Stage/Screen indicator */}
          <Rect
            x={config.width / 2 - 200}
            y={20}
            width={400}
            height={40}
            fill="#333"
            cornerRadius={4}
          />
          <Text
            x={config.width / 2 - 200}
            y={30}
            width={400}
            text="STAGE / SÂN KHẤU"
            fontSize={18}
            fill="white"
            align="center"
            fontStyle="bold"
          />

          {/* Render zones and seats */}
          {config.zones.map((zone) => (
            <Group key={zone.id}>
              {zone.rows.map((row) => (
                <Group key={row.id}>
                  {/* Row label */}
                  <Text
                    x={20}
                    y={row.seats[0]?.y || 0}
                    text={row.rowName}
                    fontSize={16}
                    fill="#666"
                    fontStyle="bold"
                  />

                  {/* Seats */}
                  {row.seats.map((seat) => (
                    <Group
                      key={seat.id}
                      onClick={() => !readonly && setSelectedSeat(seat.id)}
                      onTap={() => !readonly && setSelectedSeat(seat.id)}
                    >
                      <Rect
                        x={seat.x}
                        y={seat.y}
                        width={seat.width}
                        height={seat.height}
                        fill={seat.status === 'disabled' ? '#ccc' : zone.color}
                        stroke={selectedSeat === seat.id ? '#000' : '#fff'}
                        strokeWidth={selectedSeat === seat.id ? 2 : 1}
                        cornerRadius={4}
                        opacity={seat.status === 'disabled' ? 0.3 : 0.8}
                        shadowBlur={selectedSeat === seat.id ? 10 : 0}
                        shadowColor="black"
                      />
                      <Text
                        x={seat.x}
                        y={seat.y + 8}
                        width={seat.width}
                        text={seat.seatNumber}
                        fontSize={12}
                        fill={seat.status === 'disabled' ? '#666' : '#fff'}
                        align="center"
                        fontStyle="bold"
                      />
                    </Group>
                  ))}
                </Group>
              ))}
            </Group>
          ))}
        </Layer>
      </KonvaStage>
    );
  };

  const getTotalSeats = () => {
    return config.zones.reduce(
      (total, zone) =>
        total +
        zone.rows.reduce((rowTotal, row) => rowTotal + row.seats.filter((s) => s.status !== 'disabled').length, 0),
      0
    );
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Sơ Đồ Chỗ Ngồi</span>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'edit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('edit')}
              >
                <Grid className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button
                variant={viewMode === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('preview')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem trước
              </Button>
              {!readonly && (
                <Button onClick={() => onSave(config)} className="btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng khu vực</p>
              <p className="text-2xl font-bold">{config.zones.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Tổng chỗ ngồi</p>
              <p className="text-2xl font-bold">{getTotalSeats()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Kích thước</p>
              <p className="text-2xl font-bold">
                {config.width}x{config.height}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-6">
        {/* Left Panel - Zone Management */}
        {viewMode === 'edit' && !readonly && (
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Khu vực</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={addZone} className="w-full" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Thêm khu vực
              </Button>

              {config.zones.map((zone) => (
                <Card
                  key={zone.id}
                  className={`cursor-pointer transition-all ${
                    selectedZone === zone.id ? 'ring-2 ring-brand-500' : ''
                  }`}
                  onClick={() => setSelectedZone(zone.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge style={{ backgroundColor: zone.color }}>{zone.name}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteZone(zone.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Tên khu vực</Label>
                      <Input
                        value={zone.name}
                        onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Loại</Label>
                      <Select
                        value={zone.type}
                        onValueChange={(value: 'SEAT' | 'STANDING') =>
                          updateZone(zone.id, { type: value })
                        }
                      >
                        <SelectTrigger onClick={(e) => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SEAT">Ghế ngồi</SelectItem>
                          <SelectItem value="STANDING">Khu vực đứng</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Màu</Label>
                      <Input
                        type="color"
                        value={zone.color}
                        onChange={(e) => updateZone(zone.id, { color: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 mb-2">
                        {zone.rows.length} hàng -{' '}
                        {zone.rows.reduce((total, row) => total + row.seats.length, 0)} ghế
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            addRow(zone.id);
                          }}
                        >
                          Thêm hàng
                        </Button>
                        {zone.rows.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              const lastRow = zone.rows[zone.rows.length - 1];
                              addSeatsToRow(zone.id, lastRow.id, 10);
                            }}
                          >
                            +10 ghế
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Main Canvas */}
        <Card className={viewMode === 'edit' && !readonly ? 'col-span-3' : 'col-span-4'}>
          <CardContent className="p-6">
            <div className="flex justify-center overflow-auto">{renderSeatMap()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
