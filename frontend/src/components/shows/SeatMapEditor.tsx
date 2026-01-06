'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn, formatPrice } from '@/lib/utils';

// Types
export interface SeatLayoutTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    example: {
        zones: ZoneConfig[];
    };
}

export interface ZoneConfig {
    name: string;
    rows: number;
    seatsPerRow: number;
    colorCode?: string;
    type?: 'SEAT' | 'STANDING';
    offsetX?: number;
    offsetY?: number;
    curvature?: number;
}

export interface PhysicalSeat {
    id: number;
    zoneName: string | null;
    rowName: string | null;
    seatNumber: string | null;
    type: 'SEAT' | 'STANDING';
    xPosition: number | null;
    yPosition: number | null;
}

export interface SeatLayoutResponse {
    stage: { id: number; name: string; address: string | null };
    totalSeats: number;
    zones: { name: string; seatCount: number; seats: PhysicalSeat[] }[];
    allSeats: PhysicalSeat[];
}

// API functions
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
}

const seatLayoutApi = {
    getTemplates: () => fetchWithAuth('/seat-layouts/templates'),
    getStageSeatLayout: (stageId: number) => fetchWithAuth(`/seat-layouts/stage/${stageId}`),
    generateFromTemplate: (data: { stageId: number; template: string; zones: ZoneConfig[]; seatSpacing?: number; rowSpacing?: number; stageDistance?: number }) =>
        fetchWithAuth('/seat-layouts/generate', { method: 'POST', body: JSON.stringify(data) }),
    clearStageSeats: (stageId: number) =>
        fetchWithAuth(`/seat-layouts/stage/${stageId}`, { method: 'DELETE' }),
    updatePositions: (seats: { seatId: number; xPosition: number; yPosition: number }[]) =>
        fetchWithAuth('/seat-layouts/positions', { method: 'PUT', body: JSON.stringify({ seats }) }),
};

// Color palette for zones
const ZONE_COLORS = [
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
];

interface SeatMapEditorProps {
    stageId: number;
    onSave?: () => void;
    className?: string;
}

export function SeatMapEditor({ stageId, onSave, className }: SeatMapEditorProps) {
    const queryClient = useQueryClient();

    // State
    const [activeTab, setActiveTab] = useState<'template' | 'preview' | 'edit'>('template');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('theater_standard');
    const [zones, setZones] = useState<ZoneConfig[]>([
        { name: 'VIP', rows: 3, seatsPerRow: 12, colorCode: ZONE_COLORS[0], type: 'SEAT' },
    ]);
    const [seatSpacing, setSeatSpacing] = useState(40);
    const [rowSpacing, setRowSpacing] = useState(45);
    const [stageDistance, setStageDistance] = useState(100);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedSeatId, setDraggedSeatId] = useState<number | null>(null);
    const [pendingUpdates, setPendingUpdates] = useState<Map<number, { x: number; y: number }>>(new Map());
    const svgRef = useRef<SVGSVGElement>(null);

    // Queries
    const { data: templates, isLoading: templatesLoading } = useQuery({
        queryKey: ['seatTemplates'],
        queryFn: seatLayoutApi.getTemplates,
    });

    const { data: currentLayout, isLoading: layoutLoading, refetch: refetchLayout } = useQuery({
        queryKey: ['stageLayout', stageId],
        queryFn: () => seatLayoutApi.getStageSeatLayout(stageId),
        enabled: !!stageId,
    });

    // Mutations
    const generateMutation = useMutation({
        mutationFn: seatLayoutApi.generateFromTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stageLayout', stageId] });
            setActiveTab('preview');
        },
    });

    const clearMutation = useMutation({
        mutationFn: seatLayoutApi.clearStageSeats,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stageLayout', stageId] });
        },
    });

    const updatePositionsMutation = useMutation({
        mutationFn: seatLayoutApi.updatePositions,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stageLayout', stageId] });
            setPendingUpdates(new Map());
        },
    });

    // Handlers
    const addZone = () => {
        const nextColorIndex = zones.length % ZONE_COLORS.length;
        setZones([
            ...zones,
            {
                name: `Khu ${zones.length + 1}`,
                rows: 3,
                seatsPerRow: 10,
                colorCode: ZONE_COLORS[nextColorIndex],
                type: 'SEAT',
            },
        ]);
    };

    const updateZone = (index: number, updates: Partial<ZoneConfig>) => {
        setZones(zones.map((z, i) => (i === index ? { ...z, ...updates } : z)));
    };

    const removeZone = (index: number) => {
        if (zones.length > 1) {
            setZones(zones.filter((_, i) => i !== index));
        }
    };

    const handleGenerate = () => {
        generateMutation.mutate({
            stageId,
            template: selectedTemplate,
            zones,
            seatSpacing,
            rowSpacing,
            stageDistance,
        });
    };

    const handleClearSeats = () => {
        if (confirm('Bạn có chắc muốn xóa tất cả ghế? Hành động này không thể hoàn tác.')) {
            clearMutation.mutate(stageId);
        }
    };

    // Drag handlers for seat editing
    const handleSeatMouseDown = useCallback((e: React.MouseEvent, seatId: number) => {
        e.preventDefault();
        setIsDragging(true);
        setDraggedSeatId(seatId);
    }, []);

    const handleSeatMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!isDragging || !draggedSeatId || !svgRef.current) return;

            const svg = svgRef.current;
            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const cursorPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());

            setPendingUpdates((prev) => {
                const newMap = new Map(prev);
                newMap.set(draggedSeatId, { x: Math.round(cursorPt.x), y: Math.round(cursorPt.y) });
                return newMap;
            });
        },
        [isDragging, draggedSeatId],
    );

    const handleSeatMouseUp = useCallback(() => {
        setIsDragging(false);
        setDraggedSeatId(null);
    }, []);

    const handleSavePositions = () => {
        const updates = Array.from(pendingUpdates.entries()).map(([seatId, pos]) => ({
            seatId,
            xPosition: pos.x,
            yPosition: pos.y,
        }));
        if (updates.length > 0) {
            updatePositionsMutation.mutate(updates);
        }
    };

    // Calculate viewBox for SVG
    const viewBoxDimensions = useMemo(() => {
        const seats = currentLayout?.allSeats || [];
        if (seats.length === 0) return { minX: 0, minY: 0, width: 1000, height: 600 };

        const positions = seats
            .filter((s: PhysicalSeat) => s.xPosition !== null && s.yPosition !== null)
            .map((s: PhysicalSeat) => {
                const pending = pendingUpdates.get(s.id);
                return {
                    x: pending?.x ?? s.xPosition!,
                    y: pending?.y ?? s.yPosition!,
                };
            });

        if (positions.length === 0) return { minX: 0, minY: 0, width: 1000, height: 600 };

        const minX = Math.min(...positions.map((p) => p.x)) - 80;
        const minY = Math.min(...positions.map((p) => p.y)) - 120;
        const maxX = Math.max(...positions.map((p) => p.x)) + 80;
        const maxY = Math.max(...positions.map((p) => p.y)) + 80;

        return { minX, minY, width: maxX - minX, height: maxY - minY };
    }, [currentLayout, pendingUpdates]);

    // Get seat position (with pending updates)
    const getSeatPosition = (seat: PhysicalSeat) => {
        const pending = pendingUpdates.get(seat.id);
        return {
            x: pending?.x ?? seat.xPosition ?? 0,
            y: pending?.y ?? seat.yPosition ?? 0,
        };
    };

    // Get zone color
    const getZoneColor = (zoneName: string | null) => {
        const zones = currentLayout?.zones || [];
        const zoneIndex = zones.findIndex((z: { name: string }) => z.name === zoneName);
        return ZONE_COLORS[zoneIndex >= 0 ? zoneIndex % ZONE_COLORS.length : 0];
    };

    return (
        <div className={cn('seat-map-editor bg-gray-900 rounded-xl overflow-hidden', className)}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>🎭</span>
                    Trình tạo sơ đồ chỗ ngồi
                </h2>
                <p className="text-purple-200 text-sm mt-1">
                    {currentLayout?.stage?.name || 'Đang tải...'} - {currentLayout?.totalSeats || 0} ghế
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
                {(['template', 'preview', 'edit'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            'flex-1 py-3 px-4 text-sm font-medium transition-colors',
                            activeTab === tab
                                ? 'bg-gray-800 text-white border-b-2 border-purple-500'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50',
                        )}
                    >
                        {tab === 'template' && '📋 Chọn mẫu'}
                        {tab === 'preview' && '👁️ Xem trước'}
                        {tab === 'edit' && '✏️ Chỉnh sửa'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Template Tab */}
                {activeTab === 'template' && (
                    <div className="space-y-6">
                        {/* Template Selection */}
                        <div>
                            <h3 className="text-white font-semibold mb-3">Chọn loại sơ đồ</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {templatesLoading ? (
                                    <div className="col-span-full text-center text-gray-400 py-8">Đang tải...</div>
                                ) : (
                                    templates?.map((template: SeatLayoutTemplate) => (
                                        <button
                                            key={template.id}
                                            onClick={() => {
                                                setSelectedTemplate(template.id);
                                                // Auto-fill zones from template example
                                                if (template.example?.zones) {
                                                    setZones(
                                                        template.example.zones.map((z, i) => ({
                                                            ...z,
                                                            colorCode: z.colorCode || ZONE_COLORS[i % ZONE_COLORS.length],
                                                        })),
                                                    );
                                                }
                                            }}
                                            className={cn(
                                                'p-4 rounded-lg border-2 text-left transition-all',
                                                selectedTemplate === template.id
                                                    ? 'border-purple-500 bg-purple-500/20'
                                                    : 'border-gray-700 bg-gray-800 hover:border-gray-600',
                                            )}
                                        >
                                            <div className="text-3xl mb-2">{template.icon}</div>
                                            <div className="text-white font-medium">{template.name}</div>
                                            <div className="text-gray-400 text-xs mt-1">{template.description}</div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Zone Configuration */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-white font-semibold">Cấu hình khu vực</h3>
                                <button
                                    onClick={addZone}
                                    className="text-sm px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                >
                                    + Thêm khu
                                </button>
                            </div>

                            <div className="space-y-3">
                                {zones.map((zone, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-800 rounded-lg p-4 border-l-4"
                                        style={{ borderColor: zone.colorCode }}
                                    >
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div>
                                                <label className="text-gray-400 text-xs">Tên khu</label>
                                                <input
                                                    type="text"
                                                    value={zone.name}
                                                    onChange={(e) => updateZone(index, { name: e.target.value })}
                                                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-gray-400 text-xs">Số hàng</label>
                                                <input
                                                    type="number"
                                                    value={zone.rows}
                                                    onChange={(e) => updateZone(index, { rows: parseInt(e.target.value) || 1 })}
                                                    min={1}
                                                    max={50}
                                                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-gray-400 text-xs">Ghế/hàng</label>
                                                <input
                                                    type="number"
                                                    value={zone.seatsPerRow}
                                                    onChange={(e) => updateZone(index, { seatsPerRow: parseInt(e.target.value) || 1 })}
                                                    min={1}
                                                    max={100}
                                                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-gray-400 text-xs">Loại</label>
                                                <select
                                                    value={zone.type}
                                                    onChange={(e) => updateZone(index, { type: e.target.value as 'SEAT' | 'STANDING' })}
                                                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm mt-1"
                                                >
                                                    <option value="SEAT">Ghế ngồi</option>
                                                    <option value="STANDING">Đứng</option>
                                                </select>
                                            </div>
                                        </div>
                                        {selectedTemplate === 'stadium' && (
                                            <div className="mt-3">
                                                <label className="text-gray-400 text-xs">Độ cong (%)</label>
                                                <input
                                                    type="range"
                                                    value={zone.curvature ?? 30}
                                                    onChange={(e) => updateZone(index, { curvature: parseInt(e.target.value) })}
                                                    min={0}
                                                    max={100}
                                                    className="w-full mt-1"
                                                />
                                            </div>
                                        )}
                                        {zones.length > 1 && (
                                            <button
                                                onClick={() => removeZone(index)}
                                                className="mt-2 text-red-400 text-xs hover:text-red-300"
                                            >
                                                Xóa khu này
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Spacing Settings */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-gray-400 text-xs">Khoảng cách ghế (px)</label>
                                <input
                                    type="number"
                                    value={seatSpacing}
                                    onChange={(e) => setSeatSpacing(parseInt(e.target.value) || 40)}
                                    min={20}
                                    max={100}
                                    className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-xs">Khoảng cách hàng (px)</label>
                                <input
                                    type="number"
                                    value={rowSpacing}
                                    onChange={(e) => setRowSpacing(parseInt(e.target.value) || 45)}
                                    min={20}
                                    max={100}
                                    className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-xs">Khoảng cách sân khấu (px)</label>
                                <input
                                    type="number"
                                    value={stageDistance}
                                    onChange={(e) => setStageDistance(parseInt(e.target.value) || 100)}
                                    min={50}
                                    max={300}
                                    className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm mt-1"
                                />
                            </div>
                        </div>

                        {/* Generate Button */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleGenerate}
                                disabled={generateMutation.isPending}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50"
                            >
                                {generateMutation.isPending ? 'Đang tạo...' : '🎯 Tạo sơ đồ'}
                            </button>
                            {(currentLayout?.totalSeats || 0) > 0 && (
                                <button
                                    onClick={handleClearSeats}
                                    disabled={clearMutation.isPending}
                                    className="px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    🗑️ Xóa hết
                                </button>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-2">Thống kê dự kiến:</div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-white">
                                        {zones.reduce((sum, z) => sum + z.rows * z.seatsPerRow, 0)}
                                    </div>
                                    <div className="text-gray-400 text-xs">Tổng ghế</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{zones.length}</div>
                                    <div className="text-gray-400 text-xs">Khu vực</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">
                                        {zones.reduce((sum, z) => sum + z.rows, 0)}
                                    </div>
                                    <div className="text-gray-400 text-xs">Tổng hàng</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preview Tab */}
                {activeTab === 'preview' && (
                    <div className="space-y-4">
                        {layoutLoading ? (
                            <div className="flex items-center justify-center h-96">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                            </div>
                        ) : !currentLayout?.allSeats?.length ? (
                            <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                                <div className="text-6xl mb-4">🎭</div>
                                <p>Chưa có sơ đồ ghế. Vui lòng tạo ở tab "Chọn mẫu".</p>
                            </div>
                        ) : (
                            <>
                                {/* Stage */}
                                <div className="bg-gradient-to-b from-amber-600 to-amber-700 text-white text-center py-4 rounded-xl font-bold text-lg shadow-lg">
                                    🎤 SÂN KHẤU
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-lg">
                                    {currentLayout.zones.map((zone: { name: string; seatCount: number }, index: number) => (
                                        <div key={zone.name} className="flex items-center gap-2 text-sm">
                                            <span
                                                className="w-5 h-5 rounded-full"
                                                style={{ backgroundColor: ZONE_COLORS[index % ZONE_COLORS.length] }}
                                            />
                                            <span className="text-white">
                                                {zone.name} ({zone.seatCount} ghế)
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* SVG Map */}
                                <div className="relative overflow-auto bg-gray-800 rounded-lg p-4">
                                    <svg
                                        viewBox={`${viewBoxDimensions.minX} ${viewBoxDimensions.minY} ${viewBoxDimensions.width} ${viewBoxDimensions.height}`}
                                        className="w-full"
                                        style={{ minHeight: '400px', maxHeight: '600px' }}
                                        preserveAspectRatio="xMidYMid meet"
                                    >
                                        {currentLayout.allSeats.map((seat: PhysicalSeat) => {
                                            if (seat.xPosition === null || seat.yPosition === null) return null;
                                            const color = getZoneColor(seat.zoneName);
                                            return (
                                                <g key={seat.id}>
                                                    <circle
                                                        cx={seat.xPosition}
                                                        cy={seat.yPosition}
                                                        r={seat.type === 'STANDING' ? 10 : 14}
                                                        fill={color}
                                                        className="transition-all hover:opacity-80"
                                                    />
                                                    {seat.type === 'SEAT' && seat.seatNumber && (
                                                        <text
                                                            x={seat.xPosition}
                                                            y={seat.yPosition! + 4}
                                                            textAnchor="middle"
                                                            fontSize={9}
                                                            fill="#fff"
                                                            fontWeight="bold"
                                                        >
                                                            {seat.seatNumber}
                                                        </text>
                                                    )}
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {currentLayout.zones.map((zone: { name: string; seatCount: number }, index: number) => (
                                        <div
                                            key={zone.name}
                                            className="bg-gray-800 rounded-lg p-4 border-l-4"
                                            style={{ borderColor: ZONE_COLORS[index % ZONE_COLORS.length] }}
                                        >
                                            <div className="text-white font-semibold">{zone.name}</div>
                                            <div className="text-2xl font-bold text-white">{zone.seatCount}</div>
                                            <div className="text-gray-400 text-xs">ghế</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Edit Tab */}
                {activeTab === 'edit' && (
                    <div className="space-y-4">
                        <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-yellow-400">
                                <span>✏️</span>
                                <span className="font-semibold">Chế độ chỉnh sửa</span>
                            </div>
                            <p className="text-yellow-200 text-sm mt-1">
                                Kéo thả ghế để thay đổi vị trí. Nhấn "Lưu thay đổi" khi hoàn tất.
                            </p>
                        </div>

                        {!currentLayout?.allSeats?.length ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <p>Chưa có ghế để chỉnh sửa.</p>
                            </div>
                        ) : (
                            <>
                                {/* Stage */}
                                <div className="bg-gradient-to-b from-amber-600 to-amber-700 text-white text-center py-4 rounded-xl font-bold text-lg">
                                    🎤 SÂN KHẤU
                                </div>

                                {/* Editable SVG Map */}
                                <div className="relative overflow-auto bg-gray-800 rounded-lg p-4">
                                    <svg
                                        ref={svgRef}
                                        viewBox={`${viewBoxDimensions.minX} ${viewBoxDimensions.minY} ${viewBoxDimensions.width} ${viewBoxDimensions.height}`}
                                        className="w-full"
                                        style={{ minHeight: '400px', maxHeight: '600px', cursor: isDragging ? 'grabbing' : 'default' }}
                                        preserveAspectRatio="xMidYMid meet"
                                        onMouseMove={handleSeatMouseMove}
                                        onMouseUp={handleSeatMouseUp}
                                        onMouseLeave={handleSeatMouseUp}
                                    >
                                        {currentLayout.allSeats.map((seat: PhysicalSeat) => {
                                            if (seat.xPosition === null || seat.yPosition === null) return null;
                                            const pos = getSeatPosition(seat);
                                            const color = getZoneColor(seat.zoneName);
                                            const isBeingDragged = draggedSeatId === seat.id;
                                            const hasChanges = pendingUpdates.has(seat.id);

                                            return (
                                                <g
                                                    key={seat.id}
                                                    onMouseDown={(e) => handleSeatMouseDown(e, seat.id)}
                                                    className={cn(
                                                        'cursor-grab transition-all',
                                                        isBeingDragged && 'cursor-grabbing',
                                                    )}
                                                >
                                                    <circle
                                                        cx={pos.x}
                                                        cy={pos.y}
                                                        r={seat.type === 'STANDING' ? 10 : 14}
                                                        fill={color}
                                                        stroke={hasChanges ? '#10B981' : 'transparent'}
                                                        strokeWidth={hasChanges ? 3 : 0}
                                                        className={cn(
                                                            'transition-all',
                                                            isBeingDragged && 'opacity-70',
                                                        )}
                                                    />
                                                    {seat.type === 'SEAT' && seat.seatNumber && (
                                                        <text
                                                            x={pos.x}
                                                            y={pos.y + 4}
                                                            textAnchor="middle"
                                                            fontSize={9}
                                                            fill="#fff"
                                                            fontWeight="bold"
                                                            className="pointer-events-none"
                                                        >
                                                            {seat.seatNumber}
                                                        </text>
                                                    )}
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSavePositions}
                                        disabled={pendingUpdates.size === 0 || updatePositionsMutation.isPending}
                                        className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        {updatePositionsMutation.isPending
                                            ? 'Đang lưu...'
                                            : `💾 Lưu thay đổi (${pendingUpdates.size} ghế)`}
                                    </button>
                                    <button
                                        onClick={() => setPendingUpdates(new Map())}
                                        disabled={pendingUpdates.size === 0}
                                        className="px-4 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50"
                                    >
                                        ↩️ Hoàn tác
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
