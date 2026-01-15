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
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['seatMap', showId],
    queryFn: () => showService.getShowSeats(showId),
    refetchInterval: 30000, // Refresh every 30s
    staleTime: 10000,
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
          // Lock expired - reset selection
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
      if (lockCountdown !== null) return; // Don't allow changes when locked

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

  // Get seat color based on status and selection
  const getSeatColor = (ticket: SeatMapTicket) => {
    if (selectedSeats.includes(ticket.id)) {
      return '#10B981'; // Green for selected
    }
    if (ticket.status === 'SOLD') {
      return '#374151'; // Gray for sold
    }
    if (ticket.status === 'LOCKED') {
      return '#EF4444'; // Red for locked
    }
    return ticket.ticketClass?.colorCode || '#3B82F6'; // Ticket class color or default blue
  };

  // Handle lock button click
  const handleLockClick = () => {
    if (selectedSeats.length === 0) return;
    lockMutation.mutate(selectedSeats);
  };

  // Handle release button click
  const handleReleaseClick = () => {
    releaseMutation.mutate();
  };

  // Calculate SVG viewBox dimensions
  const viewBoxDimensions = useMemo(() => {
    if (!seats?.tickets?.length) return { minX: 0, minY: 0, width: 1000, height: 600 };

    const seatsWithPosition = seats.tickets.filter(
      (t: SeatMapTicket) => t.seat?.x !== null && t.seat?.y !== null,
    );

    if (seatsWithPosition.length === 0) {
      return { minX: 0, minY: 0, width: 1000, height: 600 };
    }

    const xs = seatsWithPosition.map((t: SeatMapTicket) => t.seat?.x || 0);
    const ys = seatsWithPosition.map((t: SeatMapTicket) => t.seat?.y || 0);

    const minX = Math.min(...xs) - 50;
    const minY = Math.min(...ys) - 100;
    const maxX = Math.max(...xs) + 50;
    const maxY = Math.max(...ys) + 50;

    return {
      minX,
      minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [seats]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!seats?.tickets?.length) {
    return (
      <div className={cn('text-center p-8 text-muted-foreground', className)}>
        Chưa có sơ đồ ghế cho sự kiện này.
      </div>
    );
  }

  return (
    <div className={cn('seat-map-container', className)}>
      {/* Stage visualization */}
      <div className="bg-gradient-to-b from-gray-700 to-gray-800 text-white text-center py-3 rounded-t-xl font-semibold">
        SAN KHAU
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-4 h-4 rounded-full bg-gray-500" />
          <span>Da ban</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-4 h-4 rounded-full bg-red-500" />
          <span>Đang giữ</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-4 h-4 rounded-full bg-green-500" />
          <span>Đang chọn</span>
        </div>
        <div className="border-l pl-4 ml-2 flex flex-wrap gap-3">
          {ticketClasses.map((tc) => (
            <div key={tc.id} className="flex items-center gap-2 text-sm">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: tc.colorCode || '#3B82F6' }}
              />
              <span>
                {tc.name} - {formatPrice(tc.price)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Seat Grid */}
      <div className="relative overflow-auto bg-gray-100 dark:bg-gray-800 p-4">
        <svg
          viewBox={`${viewBoxDimensions.minX} ${viewBoxDimensions.minY} ${viewBoxDimensions.width} ${viewBoxDimensions.height}`}
          className="w-full max-h-[500px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {seats.tickets.map((ticket: SeatMapTicket) => {
            if (!ticket.seat?.x || !ticket.seat?.y) return null;

            const isSelectable =
              ticket.status === 'AVAILABLE' && lockCountdown === null;
            const isSelected = selectedSeats.includes(ticket.id);

            return (
              <g
                key={ticket.id}
                onClick={() => handleSeatClick(ticket)}
                className={cn(
                  'transition-transform',
                  isSelectable && 'cursor-pointer hover:scale-110',
                  !isSelectable && 'cursor-not-allowed opacity-80',
                )}
              >
                <circle
                  cx={ticket.seat.x}
                  cy={ticket.seat.y}
                  r={ticket.seat.type === 'STANDING' ? 12 : 15}
                  fill={getSeatColor(ticket)}
                  stroke={isSelected ? '#fff' : 'transparent'}
                  strokeWidth={isSelected ? 3 : 0}
                  className="transition-all"
                />
                {ticket.seat.type === 'SEAT' && ticket.seat.number && (
                  <text
                    x={ticket.seat.x}
                    y={ticket.seat.y + 4}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#fff"
                    fontWeight="bold"
                  >
                    {ticket.seat.number}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected seats summary */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t">
        {selectedSeats.length > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Đã chọn: <span className="font-semibold">{selectedSeats.length}</span> ghế
              </p>
              <p className="text-lg font-bold">
                Tổng: <span className="text-primary">{formatPrice(totalPrice)}</span>
              </p>
              {lockCountdown !== null && (
                <p className="text-sm text-orange-500 font-medium">
                  Còn {Math.floor(lockCountdown / 60)}:
                  {(lockCountdown % 60).toString().padStart(2, '0')} để thanh toán
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {lockCountdown !== null ? (
                <button
                  onClick={handleReleaseClick}
                  disabled={releaseMutation.isPending}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                >
                  {releaseMutation.isPending ? 'Đang hủy...' : 'Hủy giữ chỗ'}
                </button>
              ) : (
                <button
                  onClick={handleLockClick}
                  disabled={lockMutation.isPending || selectedSeats.length === 0}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {lockMutation.isPending ? 'Đang xử lý...' : 'Giữ chỗ'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Nhấn vào ghế để chọn. Tối đa {maxSelectable} ghế.
          </p>
        )}
      </div>
    </div>
  );
}
