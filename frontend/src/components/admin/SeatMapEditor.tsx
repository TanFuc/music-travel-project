'use client';
import { useState } from 'react';
import { Stage as KonvaStage, Layer, Rect, Text, Group } from 'react-konva';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Trash2, Grid, Eye } from 'lucide-react';
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
      zones: config.zones.map((zone) => (zone.id === zoneId ? { ...zone, ...updates } : zone)),
    });
  };
  const deleteZone = (zoneId: string) => {
    setConfig({
      ...config,
      zones: config.zones.filter((zone) => zone.id !== zoneId),
    });
    if (selectedZone === zoneId) setSelectedZone(null);
  };
  const addRow = (zoneId: string) => {
    const zone = config.zones.find((z) => z.id === zoneId);
    if (!zone) return;
    const rowCount = zone.rows.length;
    const rowName = String.fromCharCode(65 + rowCount);
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
  const snapToGrid = (val: number) => {
    const GRID_SIZE = 10;
    return Math.round(val / GRID_SIZE) * GRID_SIZE;
  };
  const updateSeatPosition = (
    zoneId: string,
    rowId: string,
    seatId: string,
    x: number,
    y: number,
    updates?: Partial<Seat>
  ) => {
    setConfig({
      ...config,
      zones: config.zones.map((zone) => {
        if (zone.id !== zoneId) return zone;
        return {
          ...zone,
          rows: zone.rows.map((row) => {
            if (row.id !== rowId) return row;
            return {
              ...row,
              seats: row.seats.map((seat) => {
                if (seat.id !== seatId) return seat;
                return {
                  ...seat,
                  x: snapToGrid(x),
                  y: snapToGrid(y),
                  ...(updates || {}),
                };
              }),
            };
          }),
        };
      }),
    });
  };
  const updateRowPosition = (zoneId: string, rowId: string, deltaX: number, deltaY: number) => {
    setConfig({
      ...config,
      zones: config.zones.map((zone) => {
        if (zone.id !== zoneId) return zone;
        return {
          ...zone,
          rows: zone.rows.map((row) => {
            if (row.id !== rowId) return row;
            return {
              ...row,
              seats: row.seats.map((seat) => ({
                ...seat,
                x: snapToGrid(seat.x + deltaX),
                y: snapToGrid(seat.y + deltaY),
              })),
            };
          }),
        };
      }),
    });
  };
  const renderSeatMap = () => {
    return (
      <KonvaStage
        width={config.width}
        height={config.height}
        className="rounded-lg border bg-gray-50"
      >
        <Layer>
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

          {config.zones.map((zone) => (
            <Group key={zone.id}>
              {zone.rows.map((row) => (
                <Group
                  key={row.id}
                  draggable={!readonly && viewMode === 'edit'}
                  onDragEnd={(e) => {
                    if (readonly || viewMode !== 'edit') return;
                    const dx = e.target.x();
                    const dy = e.target.y();
                    e.target.position({ x: 0, y: 0 });
                    updateRowPosition(zone.id, row.id, dx, dy);
                  }}
                >
                  <Text
                    x={20}
                    y={row.seats[0]?.y || 0}
                    text={row.rowName}
                    fontSize={16}
                    fill="#666"
                    fontStyle="bold"
                  />

                  {row.seats.map((seat) => (
                    <Group
                      key={seat.id}
                      x={seat.x}
                      y={seat.y}
                      draggable={!readonly && viewMode === 'edit'}
                      onDragStart={(e) => {
                        e.cancelBubble = true;
                      }}
                      onDragEnd={(e) => {
                        e.cancelBubble = true;
                        if (readonly || viewMode !== 'edit') return;
                        updateSeatPosition(zone.id, row.id, seat.id, e.target.x(), e.target.y());
                      }}
                      onClick={() => !readonly && setSelectedSeat(seat.id)}
                      onTap={() => !readonly && setSelectedSeat(seat.id)}
                    >
                      <Rect
                        x={0}
                        y={0}
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
                        x={0}
                        y={8}
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
        zone.rows.reduce(
          (rowTotal, row) => rowTotal + row.seats.filter((s) => s.status !== 'disabled').length,
          0
        ),
      0
    );
  };
  return (
    <div className="space-y-6">
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
                <Grid className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
              <Button
                variant={viewMode === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('preview')}
              >
                <Eye className="mr-2 h-4 w-4" />
                Xem trước
              </Button>
              {!readonly && (
                <Button onClick={() => onSave(config)} className="btn-primary">
                  <Save className="mr-2 h-4 w-4" />
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
        {viewMode === 'edit' && !readonly && (
          <div className="col-span-1 space-y-4">
            {selectedSeat &&
              (() => {
                let currentZone: SeatZone | undefined;
                let currentRow: SeatRow | undefined;
                let currentSeat: Seat | undefined;
                for (const zone of config.zones) {
                  for (const row of zone.rows) {
                    const seat = row.seats.find((s) => s.id === selectedSeat);
                    if (seat) {
                      currentZone = zone;
                      currentRow = row;
                      currentSeat = seat;
                      break;
                    }
                  }
                  if (currentSeat) break;
                }
                if (!currentSeat || !currentZone || !currentRow) return null;
                return (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Chi tiết ghế</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedSeat(null)}>
                        <span className="sr-only">Close</span>✕
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Số ghế</Label>
                        <Input
                          value={currentSeat.seatNumber}
                          onChange={(e) => {
                            const newNumber = e.target.value;
                            updateSeatPosition(
                              currentZone!.id,
                              currentRow!.id,
                              currentSeat!.id,
                              currentSeat!.x,
                              currentSeat!.y,
                              { seatNumber: newNumber }
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Trạng thái</Label>
                        <Select
                          value={currentSeat.status || 'available'}
                          onValueChange={(value: any) =>
                            updateSeatPosition(
                              currentZone!.id,
                              currentRow!.id,
                              currentSeat!.id,
                              currentSeat!.x,
                              currentSeat!.y,
                              { status: value }
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Bình thường</SelectItem>
                            <SelectItem value="disabled">Vô hiệu hóa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const updatedRows = currentZone!.rows.map((r) => {
                              if (r.id !== currentRow!.id) return r;
                              return {
                                ...r,
                                seats: r.seats.filter((s) => s.id !== currentSeat!.id),
                              };
                            });
                            updateZone(currentZone!.id, { rows: updatedRows });
                            setSelectedSeat(null);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa ghế
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Khu vực</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={addZone} className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm khu vực
                </Button>

                {config.zones.map((zone) => (
                  <Card
                    key={zone.id}
                    className={`cursor-pointer transition-all ${selectedZone === zone.id && !selectedSeat ? 'ring-2 ring-brand-500' : ''}`}
                    onClick={() => {
                      setSelectedZone(zone.id);
                      setSelectedSeat(null);
                    }}
                  >
                    <CardContent className="space-y-3 p-4">
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
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      {selectedZone === zone.id && (
                        <>
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

                          <div className="space-y-2 border-t pt-2">
                            <Label className="text-xs text-muted-foreground">
                              Quản lý hàng ghế
                            </Label>
                            <div className="max-h-40 space-y-1 overflow-y-auto">
                              {zone.rows.map((row) => (
                                <div
                                  key={row.id}
                                  className="flex items-center justify-between rounded bg-muted/50 p-1.5 text-sm"
                                >
                                  <span>
                                    Hàng {row.rowName} ({row.seats.length} ghế)
                                  </span>
                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6"
                                      title="Thêm ghế"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addSeatsToRow(zone.id, row.id, 1);
                                      }}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-destructive"
                                      title="Xóa hàng"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedRows = zone.rows.filter(
                                          (r) => r.id !== row.id
                                        );
                                        updateZone(zone.id, { rows: updatedRows });
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="border-t pt-2">
                        <p className="mb-2 text-sm text-gray-600">
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
          </div>
        )}

        <Card className={viewMode === 'edit' && !readonly ? 'col-span-3' : 'col-span-4'}>
          <CardContent className="p-6">
            <div className="flex justify-center overflow-auto">{renderSeatMap()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
