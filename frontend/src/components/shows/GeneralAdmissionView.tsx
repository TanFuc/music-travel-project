'use client';
import { useState } from 'react';
import { Users, Ticket, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
interface TicketClass {
  id: number;
  name: string;
  price: number;
  colorCode: string | null;
  availableCount: number;
  totalQuantity?: number;
}
interface GeneralAdmissionViewProps {
  showId: number;
  ticketClasses: TicketClass[];
  onSelectTicketClass?: (ticketClass: TicketClass, quantity: number) => void;
  maxQuantity?: number;
}
export function GeneralAdmissionView({
  showId: _showId,
  ticketClasses,
  onSelectTicketClass,
  maxQuantity = 10,
}: GeneralAdmissionViewProps) {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [expandedInfo, setExpandedInfo] = useState(false);
  const handleQuantityChange = (classId: number, delta: number) => {
    const current = quantities[classId] || 0;
    const ticketClass = ticketClasses.find((tc) => tc.id === classId);
    const maxAvailable = Math.min(ticketClass?.availableCount || 0, maxQuantity);
    const newQuantity = Math.max(0, Math.min(current + delta, maxAvailable));
    setQuantities((prev) => ({
      ...prev,
      [classId]: newQuantity,
    }));
  };
  const totalTickets = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalPrice = ticketClasses.reduce((sum, tc) => {
    return sum + (quantities[tc.id] || 0) * tc.price;
  }, 0);
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="rounded-t-xl bg-gradient-to-b from-neutral-800 to-neutral-900 py-4 text-center text-lg font-semibold text-white shadow-lg">
          SAN KHAU
        </div>
        <div className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-l-[20px] border-r-[20px] border-t-[10px] border-l-transparent border-r-transparent border-t-neutral-900"></div>
      </div>

      <div
        className="cursor-pointer rounded-lg border border-blue-200 bg-blue-50 p-4"
        onClick={() => setExpandedInfo(!expandedInfo)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">Ve tu do (General Admission)</h4>
              <p className="text-sm text-blue-700">
                Tu chon cho ngoi trong khu vuc khi vao su kien
              </p>
            </div>
          </div>
          {expandedInfo ? (
            <ChevronUp className="h-5 w-5 text-blue-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-blue-600" />
          )}
        </div>

        {expandedInfo && (
          <div className="mt-4 space-y-2 border-t border-blue-200 pt-4 text-sm text-blue-800">
            <p className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Voi ve tu do, ban co the ngoi bat ky cho nao trong khu vuc ve cua minh.
            </p>
            <p className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Cho ngoi se duoc phan bo theo thu tu den truoc - duoc truoc (first-come,
              first-served).
            </p>
            <p className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Nen den som de co cho ngoi tot nhat!
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="flex items-center gap-2 text-lg font-semibold">
          <Ticket className="h-5 w-5" />
          Chon loai ve
        </h4>

        {ticketClasses.map((tc) => {
          const quantity = quantities[tc.id] || 0;
          const isAvailable = tc.availableCount > 0;
          return (
            <Card
              key={tc.id}
              className={`transition-all ${
                selectedClass === tc.id
                  ? 'shadow-md ring-2 ring-brand-500'
                  : isAvailable
                    ? 'cursor-pointer hover:shadow-md'
                    : 'opacity-60'
              }`}
              onClick={() => isAvailable && setSelectedClass(tc.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-1 items-center gap-3">
                    <div
                      className="h-12 w-4 rounded-full"
                      style={{ backgroundColor: tc.colorCode || '#3B82F6' }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold">{tc.name}</h5>
                        {!isAvailable && <Badge variant="destructive">Het ve</Badge>}
                      </div>
                      <p className="text-sm text-neutral-500">Con {tc.availableCount} ve</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-brand-600">{formatCurrency(tc.price)}</p>
                    <p className="text-xs text-neutral-500">/ve</p>
                  </div>

                  {isAvailable && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(tc.id, -1);
                        }}
                        disabled={quantity <= 0}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(tc.id, 1);
                        }}
                        disabled={quantity >= Math.min(tc.availableCount, maxQuantity)}
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalTickets > 0 && (
        <Card className="border-brand-200 bg-brand-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-700">Tong cong</p>
                <p className="text-xl font-bold text-brand-900">{formatCurrency(totalPrice)}</p>
                <p className="text-sm text-brand-600">{totalTickets} ve</p>
              </div>
              <Button
                size="lg"
                className="bg-brand-600 hover:bg-brand-700"
                onClick={() => {
                  ticketClasses.forEach((tc) => {
                    const qty = quantities[tc.id] || 0;
                    if (qty > 0 && onSelectTicketClass) {
                      onSelectTicketClass(tc, qty);
                    }
                  });
                }}
              >
                Dat ve ngay
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg bg-neutral-50 p-4">
        <h5 className="mb-3 text-sm font-medium text-neutral-700">Chu thich khu vuc</h5>
        <div className="flex flex-wrap gap-3">
          {ticketClasses.map((tc) => (
            <div key={tc.id} className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: tc.colorCode || '#3B82F6' }}
              />
              <span className="text-sm">{tc.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
