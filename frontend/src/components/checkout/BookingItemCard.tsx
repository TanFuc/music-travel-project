import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface BookingItemCardProps {
    item: {
        id: number;
        itemType: 'SHOW_TICKET' | 'TOUR_SLOT' | 'SINGER_PACKAGE';
        quantity: number;
        originalPrice: number;
        ticket?: {
            show?: { title: string };
            ticketClass?: { name: string };
            physicalSeat?: {
                zoneName: string;
                rowName: string;
                seatNumber: string;
            };
        };
        tourSchedule?: {
            startDate: string;
            tour?: { title: string };
        };
        ticketTier?: { name: string };
        singerPackage?: {
            name: string;
            description?: string;
            benefits?: string[];
        };
    };
    index: number;
}

export const BookingItemCard = memo(function BookingItemCard({ item, index }: BookingItemCardProps) {
    const isTicket = item.itemType === 'SHOW_TICKET';
    const isTour = item.itemType === 'TOUR_SLOT';
    const isSingerPackage = item.itemType === 'SINGER_PACKAGE';

    const showTitle = item.ticket?.show?.title;
    const ticketTierName = item.ticketTier?.name;
    const ticketClassName = item.ticket?.ticketClass?.name;
    const tourTitle = item.tourSchedule?.tour?.title;
    const packageName = item.singerPackage?.name;
    const packageDescription = item.singerPackage?.description;
    const packageBenefits = item.singerPackage?.benefits;
    const seatInfo = item.ticket?.physicalSeat
        ? `${item.ticket.physicalSeat.zoneName || ''} - Hàng ${item.ticket.physicalSeat.rowName}, Ghế ${item.ticket.physicalSeat.seatNumber}`
        : null;

    const unitPrice = item.originalPrice;
    const totalPrice = unitPrice * item.quantity;

    return (
        <div className={`rounded-lg p-4 space-y-3 ${isSingerPackage ? 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200' : 'bg-neutral-50'}`}>
            {/* Item Header */}
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-neutral-900 truncate">
                        {isTicket
                            ? (showTitle || 'Vé xem show')
                            : isTour
                                ? (tourTitle || 'Tour du lịch')
                                : (packageName || 'Gói ca sĩ')
                        }
                    </p>
                    <Badge
                        variant="outline"
                        className={`mt-1 text-xs ${isSingerPackage ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                    >
                        {isTicket ? 'Vé xem show' : isTour ? 'Tour' : 'Gói ca sĩ'}
                    </Badge>
                </div>
                <span className="text-xs text-neutral-500">#{index + 1}</span>
            </div>

            {/* Item Details */}
            <div className="space-y-2 text-sm">
                {/* Singer Package Description */}
                {isSingerPackage && packageDescription && (
                    <div className="pb-2 border-b border-green-200">
                        <p className="text-neutral-700 leading-relaxed">{packageDescription}</p>
                    </div>
                )}

                {/* Singer Package Benefits */}
                {isSingerPackage && packageBenefits && packageBenefits.length > 0 && (
                    <div className="pb-2 border-b border-green-200">
                        <p className="font-semibold text-green-800 mb-2">Quyền lợi:</p>
                        <ul className="space-y-1.5 ml-1">
                            {packageBenefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-neutral-700">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span className="flex-1 leading-relaxed">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Ticket Tier or Class */}
                {(ticketTierName || ticketClassName) && (
                    <div className="flex justify-between">
                        <span className="text-neutral-600">Loại vé:</span>
                        <span className="font-medium">{ticketTierName || ticketClassName}</span>
                    </div>
                )}

                {/* Seat Info */}
                {seatInfo && (
                    <div className="flex justify-between">
                        <span className="text-neutral-600">Vị trí:</span>
                        <span className="font-medium">{seatInfo}</span>
                    </div>
                )}

                {/* Tour Schedule */}
                {isTour && item.tourSchedule?.startDate && (
                    <div className="flex justify-between">
                        <span className="text-neutral-600">Ngày khởi hành:</span>
                        <span className="font-medium">
                            {new Date(item.tourSchedule.startDate).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                )}

                {/* Quantity */}
                <div className="flex justify-between pt-1 border-t border-neutral-200">
                    <span className="text-neutral-600 font-medium">Số lượng:</span>
                    <span className="font-semibold">{item.quantity}</span>
                </div>

                {/* Unit Price */}
                <div className="flex justify-between">
                    <span className="text-neutral-600 font-medium">Đơn giá:</span>
                    <span className="font-semibold">{formatCurrency(unitPrice)}</span>
                </div>
            </div>

            {/* Item Total */}
            <div className="flex justify-between pt-2 border-t border-neutral-200">
                <span className="text-sm font-medium text-neutral-700">Thành tiền:</span>
                <span className="font-bold text-brand-600">{formatCurrency(totalPrice)}</span>
            </div>
        </div>
    );
});
