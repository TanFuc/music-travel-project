import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
interface CartItemCardProps {
  type: 'ticket' | 'ticketTier' | 'tour' | 'singerPackage';
  data: {
    id: number | string;
    name: string;
    quantity: number;
    price: number;
    description?: string;
    benefits?: string[];
  };
  index: number;
}
export const CartItemCard = memo(function CartItemCard({ type, data, index }: CartItemCardProps) {
  const isSingerPackage = type === 'singerPackage';
  const totalPrice = data.price * data.quantity;
  const typeLabels = {
    ticket: 'Vé xem show',
    ticketTier: 'Vé xem show',
    tour: 'Tour',
    singerPackage: 'Gói ca sĩ',
  };
  return (
    <div
      className={`rounded-lg p-${isSingerPackage ? '4' : '3'} space-y-${isSingerPackage ? '3' : '2'} ${
        isSingerPackage
          ? 'border border-green-200 bg-gradient-to-r from-green-50 to-blue-50'
          : 'bg-neutral-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold text-neutral-900 ${isSingerPackage ? '' : 'truncate'}`}
          >
            {data.name}
          </p>
          <Badge
            variant="outline"
            className={`mt-1 text-xs ${isSingerPackage ? 'border-green-300 bg-green-100 font-semibold text-green-800' : ''}`}
          >
            {typeLabels[type]}
          </Badge>
        </div>
        <span className="text-xs text-neutral-500">#{index + 1}</span>
      </div>

      {isSingerPackage && data.description && (
        <div className="border-b border-green-200 pb-2">
          <p className="text-sm leading-relaxed text-neutral-700">{data.description}</p>
        </div>
      )}

      {isSingerPackage && data.benefits && data.benefits.length > 0 && (
        <div className="border-b border-green-200 pb-2">
          <p className="mb-2 text-sm font-semibold text-green-800">Quyền lợi:</p>
          <ul className="ml-1 space-y-1.5">
            {data.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-neutral-700">
                <span className="mt-0.5 font-bold text-green-600">✓</span>
                <span className="flex-1 leading-relaxed">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`space-y-1 text-sm ${isSingerPackage ? 'pt-1' : ''}`}>
        <div className="flex justify-between">
          <span className={`text-neutral-600 ${isSingerPackage ? 'font-medium' : ''}`}>
            {type === 'tour' ? 'Số người:' : 'Số lượng:'}
          </span>
          <span className={isSingerPackage ? 'font-semibold' : 'font-medium'}>{data.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className={`text-neutral-600 ${isSingerPackage ? 'font-medium' : ''}`}>
            {type === 'tour' ? 'Đơn giá/người:' : 'Đơn giá:'}
          </span>
          <span className={isSingerPackage ? 'font-semibold' : 'font-medium'}>
            {formatCurrency(data.price)}
          </span>
        </div>
      </div>

      <div
        className={`flex justify-between border-t pt-2 ${isSingerPackage ? 'border-green-300' : 'border-neutral-200'}`}
      >
        <span
          className={`text-sm font-${isSingerPackage ? 'bold' : 'medium'} ${isSingerPackage ? 'text-neutral-800' : 'text-neutral-700'}`}
        >
          Thành tiền:
        </span>
        <span
          className={`font-bold ${isSingerPackage ? 'text-base text-green-700' : 'text-brand-600'}`}
        >
          {formatCurrency(totalPrice)}
        </span>
      </div>
    </div>
  );
});
