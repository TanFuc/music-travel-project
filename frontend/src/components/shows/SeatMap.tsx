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
  const [lockId, setLockId] = useState<string | null>(null);

  // Fetch seat map data
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

  // Lock tickets mutation
  const lockMutation = useMutation({
    mutationFn: (ticketIds: number[]) => ticketService.lockTickets(ticketIds),
    onSuccess: (data) => {
      setLockId(data.lockId);
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

  // Release tickets mutation
  const releaseMutation = useMutation({
    mutationFn: () => ticketService.releaseAllTickets(),
    onSuccess: () => {
      setSelectedSeats([]);
      setLockCountdown(null);
      setLockId(null);
      queryClient.invalidateQueries({ queryKey: ['seatMap', showId] });
    },
  });

  // Countdown timer
  useEffect(() => {
    if (lockCountdown === null || lockCountdown <= 0) return;

    const timer = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setSelectedSeats([]);
          setLockId(null);
          refetch();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockCountdown, refetch]);

  // Get unique ticket classes for legend
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

  // Calculate price for ticket selection
  const calculatePrice = useCallback(
    (ticketIds: number[]) => {
      if (!seats?.tickets) return 0;
      return ticketIds.reduce((sum, ticketId) => {
        const ticket = seats.tickets.find((t: SeatMapTicket) => t.id === ticketId);
        return sum + (ticket?.ticketClass?.price || 0);
      }, 0);
    },
    [seats],
  );

  // Calculate total price
  const totalPrice = useMemo(() => {
    return calculatePrice(selectedSeats);
  }, [calculatePrice, selectedSeats]);

  // Handle seat click
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
    [lockCountdown, maxSelectable, onSeatsSelected, calculatePrice],
  );

  // Handle lock button click
  const handleLockClick = () => {
    if (selectedSeats.length === 0) return;
    lockMutation.mutate(selectedSeats);
  };

  // Handle release button click
  const handleReleaseClick = () => {
    releaseMutation.mutate();
  };

  // Calculate SVG viewBox dimensions - MEMOIZED to prevent shifts
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

  // Loading state
  if (isPending && !seats) {
    return (
      <div className={cn('flex items-center justify-center p-12 min-h-[400px]', className)}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          <p className="text-sm text-muted-foreground">Đang tải sơ đồ...</p>
        </div>
      </div>
    );
  }

  if (!seats?.tickets?.length) {
    return (
      <div className={cn('flex items-center justify-center p-12 min-h-[300px] text-muted-foreground bg-neutral-50 rounded-xl border border-dashed', className)}>
        Chưa có sơ đồ ghế cho sự kiện này.
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full bg-white border rounded-xl shadow-sm overflow-hidden', className)}>
      {/* Legend Header */}
      <div className="bg-neutral-50 border-b p-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-neutral-200 border border-neutral-300" />
            <span className="text-neutral-600">Đã bán</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-red-100 border border-red-200" />
            <span className="text-neutral-600">Đang giữ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-green-500 border border-green-600 shadow-sm" />
            <span className="text-neutral-600 font-medium">Đang chọn</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-neutral-300 mx-2" />
          {ticketClasses.map((tc) => (
            <div key={tc.id} className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-md shadow-sm"
                style={{ backgroundColor: tc.colorCode || '#3B82F6' }}
              />
              <span className="text-neutral-700 font-medium">{tc.name}</span>
              <span className="text-neutral-500 text-xs">({formatPrice(tc.price)})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="relative flex-1 overflow-auto bg-white p-6 min-h-[500px] flex items-center justify-center">
        {isRefetching && (
          <div className="absolute top-4 right-4 z-10">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500" />
          </div>
        )}

        {/* Helper text for mobile */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm sm:hidden pointer-events-none z-10">
          Chạm và kéo để di chuyển
        </div>

        <svg
          viewBox={`${viewBoxDimensions.minX} ${viewBoxDimensions.minY} ${viewBoxDimensions.width} ${viewBoxDimensions.height}`}
          className="min-w-[800px] sm:min-w-0 w-full h-full max-h-[600px] touch-pan-x touch-pan-y select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Stage Visual */}
          <g transform={`translate(${viewBoxDimensions.minX + viewBoxDimensions.width / 2}, ${viewBoxDimensions.minY + 40})`}>
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
            <text x="0" y="35" textAnchor="middle" fill="#64748b" fontSize="14" fontWeight="600" letterSpacing="0.1em">
              SÂN KHẤU
            </text>
          </g>

          {/* Seats */}
          {seats.tickets.map((ticket: SeatMapTicket) => {
            if (typeof ticket.seat?.x !== 'number' || typeof ticket.seat?.y !== 'number') return null;

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

      {/* Footer / Action Bar */}
      <div className="p-4 bg-white border-t z-10 shadow-up">
        {selectedSeats.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                {selectedSeats.length}
              </div>
              <div>
                <p className="text-sm text-neutral-500">Tổng tiền tạm tính</p>
                <p className="text-xl font-bold text-brand-600">{formatPrice(totalPrice)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {lockCountdown !== null ? (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="text-right mr-2">
                    <p className="text-xs text-neutral-500">Thời gian giữ vé</p>
                    <p className="text-lg font-mono font-bold text-orange-600 w-[60px]">
                      {Math.floor(lockCountdown / 60)}:{(lockCountdown % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <button
                    onClick={handleReleaseClick}
                    disabled={releaseMutation.isPending}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-neutral-100 text-neutral-700 font-medium rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
                  >
                    {releaseMutation.isPending ? 'Đang hủy...' : 'Hủy bỏ'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedSeats([])}
                    className="px-4 py-2.5 text-neutral-500 hover:text-neutral-700 font-medium transition"
                  >
                    Xóa chọn
                  </button>
                  <button
                    onClick={handleLockClick}
                    disabled={lockMutation.isPending}
                    className={cn(
                      'flex-1 sm:flex-none px-8 py-2.5 bg-brand-600 text-white font-bold rounded-lg shadow-lg shadow-brand-200 hover:bg-brand-700 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none',
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
          <div className="flex items-center justify-center gap-2 text-neutral-400 py-2">
            <span className="text-sm">Vui lòng chọn ghế trên sơ đồ. Tối đa {maxSelectable} ghế mỗi lần đặt.</span>
          </div>
        )}
      </div>
    </div>
  );
}
