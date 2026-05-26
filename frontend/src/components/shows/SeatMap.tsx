'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showService } from '@/services/show.service';
import { ticketService, SeatMapTicket } from '@/services/ticket.service';
import { cn, formatPrice } from '@/lib/utils';
interface SeatMapProps {
  showId: number;
  onSeatsSelected?: (ticketIds: number[], totalPrice: number) => void;
  onLockSuccess?: (lockId: string, expiresAt: Date) => void;
  maxSelectable?: number;
  className?: string;
}
interface TicketClass {
  id: number;
  name: string;
  price: number;
  colorCode: string | null;
}
export function SeatMap({
  showId,
  onSeatsSelected,
  onLockSuccess,
  maxSelectable = 10,
  className,
}: SeatMapProps) {
  const queryClient = useQueryClient();
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [lockCountdown, setLockCountdown] = useState<number | null>(null);
  const {
    data: seats,
    isPending,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['seatMap', showId],
    queryFn: () => showService.getShowSeats(showId),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
  const lockMutation = useMutation({
    mutationFn: (ticketIds: number[]) => ticketService.lockTickets(ticketIds),
    onSuccess: (data) => {
      const expiresAt = new Date(data.expiresAt);
      const secondsUntilExpiry = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
      setLockCountdown(secondsUntilExpiry > 0 ? secondsUntilExpiry : 600);
      onLockSuccess?.(data.lockId, expiresAt);
      queryClient.invalidateQueries({ queryKey: ['seatMap', showId] });
    },
    onError: () => {
      refetch();
    },
  });
  const releaseMutation = useMutation({
    mutationFn: () => ticketService.releaseAllTickets(),
    onSuccess: () => {
      setSelectedSeats([]);
      setLockCountdown(null);
      queryClient.invalidateQueries({ queryKey: ['seatMap', showId] });
    },
  });
  useEffect(() => {
    if (lockCountdown === null || lockCountdown <= 0) return;
    const timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setSelectedSeats([]);
          refetch();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockCountdown, refetch]);
  const ticketClasses = useMemo(() => {
    if (!seats?.tickets) return [];
    const classMap = new Map<number, TicketClass>();
    seats.tickets.forEach((ticket: SeatMapTicket) => {
      if (ticket.ticketClass && !classMap.has(ticket.ticketClass.id)) {
        classMap.set(ticket.ticketClass.id, ticket.ticketClass);
      }
    });
    return Array.from(classMap.values());
  }, [seats]);
  const calculatePrice = useCallback(
    (ticketIds: number[]) => {
      if (!seats?.tickets) return 0;
      return ticketIds.reduce((sum, ticketId) => {
        const ticket = seats.tickets.find((t: SeatMapTicket) => t.id === ticketId);
        return sum + (ticket?.ticketClass?.price || 0);
      }, 0);
    },
    [seats]
  );
  const totalPrice = useMemo(() => {
    return calculatePrice(selectedSeats);
  }, [calculatePrice, selectedSeats]);
  const handleSeatClick = useCallback(
    (ticket: SeatMapTicket) => {
      if (ticket.status !== 'AVAILABLE') return;
      if (lockCountdown !== null) return;
      setSelectedSeats((prev) => {
        const isSelected = prev.includes(ticket.id);
        if (isSelected) {
          const newSelection = prev.filter((id) => id !== ticket.id);
          onSeatsSelected?.(newSelection, calculatePrice(newSelection));
          return newSelection;
        }
        if (prev.length >= maxSelectable) return prev;
        const newSelection = [...prev, ticket.id];
        onSeatsSelected?.(newSelection, calculatePrice(newSelection));
        return newSelection;
      });
    },
    [lockCountdown, maxSelectable, onSeatsSelected, calculatePrice]
  );
  const handleLockClick = () => {
    if (selectedSeats.length === 0) return;
    lockMutation.mutate(selectedSeats);
  };
  const handleReleaseClick = () => {
    releaseMutation.mutate();
  };
  const viewBoxDimensions = useMemo(() => {
    const fallback = { minX: 0, minY: 0, width: 800, height: 600 };
    if (!seats?.tickets?.length) return fallback;
    const seatsWithPosition = seats.tickets.filter(
      (t: SeatMapTicket) => typeof t.seat?.x === 'number' && typeof t.seat?.y === 'number'
    );
    if (seatsWithPosition.length === 0) return fallback;
    const xs = seatsWithPosition.map((t: SeatMapTicket) => t.seat!.x as number);
    const ys = seatsWithPosition.map((t: SeatMapTicket) => t.seat!.y as number);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const paddingX = 60;
    const paddingY = 100;
    return {
      minX: minX - paddingX,
      minY: minY - paddingY,
      width: maxX - minX + paddingX * 2,
      height: maxY - minY + paddingY * 2,
    };
  }, [seats]);
  if (isPending && !seats) {
    return (
      <div className={cn('flex min-h-[400px] items-center justify-center p-12', className)}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600" />
          <p className="text-sm text-muted-foreground">Đang tải sơ đồ...</p>
        </div>
      </div>
    );
  }
  if (!seats?.tickets?.length) {
    return (
      <div
        className={cn(
          'flex min-h-[300px] items-center justify-center rounded-xl border border-dashed bg-neutral-50 p-12 text-muted-foreground',
          className
        )}
      >
        Chưa có sơ đồ ghế cho sự kiện này.
      </div>
    );
  }
  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm',
        className
      )}
    >
      <div className="border-b bg-neutral-50 p-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md border border-neutral-300 bg-neutral-200" />
            <span className="text-neutral-600">Đã bán</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md border border-red-200 bg-red-100" />
            <span className="text-neutral-600">Đang giữ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md border border-green-600 bg-green-500 shadow-sm" />
            <span className="font-medium text-neutral-600">Đang chọn</span>
          </div>
          <div className="mx-2 hidden h-4 w-px bg-neutral-300 sm:block" />
          {ticketClasses.map((tc) => (
            <div key={tc.id} className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded-md shadow-sm"
                style={{ backgroundColor: tc.colorCode || '#3B82F6' }}
              />
              <span className="font-medium text-neutral-700">{tc.name}</span>
              <span className="text-xs text-neutral-500">({formatPrice(tc.price)})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex min-h-[500px] flex-1 items-center justify-center overflow-auto bg-white p-6">
        {isRefetching && (
          <div className="absolute right-4 top-4 z-10">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-brand-500" />
          </div>
        )}

        <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm sm:hidden">
          Chạm và kéo để di chuyển
        </div>

        <svg
          viewBox={`${viewBoxDimensions.minX} ${viewBoxDimensions.minY} ${viewBoxDimensions.width} ${viewBoxDimensions.height}`}
          className="h-full max-h-[600px] w-full min-w-[800px] touch-pan-x touch-pan-y select-none sm:min-w-0"
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            transform={`translate(${viewBoxDimensions.minX + viewBoxDimensions.width / 2}, ${viewBoxDimensions.minY + 40})`}
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="15" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path
              d="M -300 0 Q 0 60 300 0 L 300 20 Q 0 80 -300 20 Z"
              fill="#1e293b"
              filter="url(#glow)"
              opacity="0.2"
            />
            <path
              d="M -300 0 Q 0 60 300 0 L 300 10 Q 0 70 -300 10 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="2"
            />
            <text
              x="0"
              y="35"
              textAnchor="middle"
              fill="#64748b"
              fontSize="14"
              fontWeight="600"
              letterSpacing="0.1em"
            >
              SÂN KHẤU
            </text>
          </g>

          {seats.tickets.map((ticket: SeatMapTicket) => {
            if (typeof ticket.seat?.x !== 'number' || typeof ticket.seat?.y !== 'number')
              return null;
            const isAvailable = ticket.status === 'AVAILABLE';
            const isLocked = ticket.status === 'LOCKED';
            const isSold = ticket.status === 'SOLD';
            const isSelectable = isAvailable && lockCountdown === null;
            const isSelected = selectedSeats.includes(ticket.id);
            let fillColor = ticket.ticketClass?.colorCode || '#3B82F6';
            let strokeColor = 'transparent';
            if (isSelected) {
              fillColor = '#10B981';
              strokeColor = '#059669';
            } else if (isSold) {
              fillColor = '#E5E7EB';
              strokeColor = '#D1D5DB';
            } else if (isLocked) {
              fillColor = '#FEE2E2';
              strokeColor = '#FCA5A5';
            }
            const seatWidth = 26;
            const seatHeight = 22;
            return (
              <g
                key={ticket.id}
                transform={`translate(${ticket.seat.x}, ${ticket.seat.y})`}
                onClick={() => handleSeatClick(ticket)}
                className={cn(
                  'transition-all duration-200 ease-out',
                  isSelectable ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed',
                  isSold && 'opacity-60 grayscale'
                )}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              >
                <title>{`${ticket.ticketClass?.name} - Hàng ${ticket.seat.row || ''} - Ghế ${ticket.seat.number || ''} - ${formatPrice(ticket.ticketClass?.price || 0)}`}</title>

                {isSelected && (
                  <circle r="20" fill="none" stroke="#10B981" strokeWidth="2" opacity="0.5" />
                )}

                <rect
                  x={-seatWidth / 2}
                  y={-seatHeight / 2}
                  width={seatWidth}
                  height={seatHeight - 5}
                  rx={4}
                  ry={4}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="1"
                />
                <path
                  d={`M ${-seatWidth / 2} ${-seatHeight / 2 + 8} Q ${-seatWidth / 2 - 4} ${-seatHeight / 2 + 12} ${-seatWidth / 2} ${seatHeight / 2}
                     L ${seatWidth / 2} ${seatHeight / 2} Q ${seatWidth / 2 + 4} ${-seatHeight / 2 + 12} ${seatWidth / 2} ${-seatHeight / 2 + 8}`}
                  fill={fillColor}
                  fillOpacity="0.8"
                  stroke={strokeColor}
                  strokeWidth="1"
                />

                {ticket.seat.number && (
                  <text
                    y={5}
                    textAnchor="middle"
                    fontSize="9"
                    fill={isSold ? '#9CA3AF' : '#FFFFFF'}
                    fontWeight="500"
                    pointerEvents="none"
                    style={{ textShadow: isSelected ? 'none' : '0px 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {ticket.seat.number}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="shadow-up z-10 border-t bg-white p-4">
        {selectedSeats.length > 0 ? (
          <div className="flex flex-col items-center justify-between gap-4 duration-300 animate-in fade-in slide-in-from-bottom-2 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-600">
                {selectedSeats.length}
              </div>
              <div>
                <p className="text-sm text-neutral-500">Tổng tiền tạm tính</p>
                <p className="text-xl font-bold text-brand-600">{formatPrice(totalPrice)}</p>
              </div>
            </div>

            <div className="flex w-full items-center gap-3 sm:w-auto">
              {lockCountdown !== null ? (
                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <div className="mr-2 text-right">
                    <p className="text-xs text-neutral-500">Thời gian giữ vé</p>
                    <p className="w-[60px] font-mono text-lg font-bold text-orange-600">
                      {Math.floor(lockCountdown / 60)}:
                      {(lockCountdown % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <button
                    onClick={handleReleaseClick}
                    disabled={releaseMutation.isPending}
                    className="flex-1 rounded-lg bg-neutral-100 px-6 py-2.5 font-medium text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-50 sm:flex-none"
                  >
                    {releaseMutation.isPending ? 'Đang hủy...' : 'Hủy bỏ'}
                  </button>
                </div>
              ) : (
                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <button
                    onClick={() => setSelectedSeats([])}
                    className="px-4 py-2.5 font-medium text-neutral-500 transition hover:text-neutral-700"
                  >
                    Xóa chọn
                  </button>
                  <button
                    onClick={handleLockClick}
                    disabled={lockMutation.isPending}
                    className={cn(
                      'flex-1 rounded-lg bg-brand-600 px-8 py-2.5 font-bold text-white shadow-lg shadow-brand-200 transition-all hover:scale-105 hover:bg-brand-700 disabled:scale-100 disabled:opacity-50 disabled:shadow-none sm:flex-none',
                      lockMutation.isPending && 'animate-pulse'
                    )}
                  >
                    {lockMutation.isPending ? 'Đang xử lý...' : 'Xác nhận giữ chỗ'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2 text-neutral-400">
            <span className="text-sm">
              Vui lòng chọn ghế trên sơ đồ. Tối đa {maxSelectable} ghế mỗi lần đặt.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
