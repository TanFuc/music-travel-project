'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, Ticket } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tourBookingSchema, TourBookingFormData } from '@/lib/validations/booking.schema';
import { formatCurrency } from '@/lib/utils';
interface BookingFormProps {
  scheduleId: number;
  price: number;
  maxQuantity: number;
  onSubmit: (data: TourBookingFormData) => void;
  isSubmitting?: boolean;
}
export function BookingForm({
  scheduleId,
  price,
  maxQuantity,
  onSubmit,
  isSubmitting = false,
}: BookingFormProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TourBookingFormData>({
    resolver: zodResolver(tourBookingSchema),
    defaultValues: {
      tourScheduleId: scheduleId,
      quantity: 1,
      passengers: [{ fullName: '', dateOfBirth: '', idNumber: '' }],
      voucherCode: '',
      note: '',
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'passengers',
  });
  const quantity = watch('quantity');
  const totalAmount = quantity * price;
  const handleAddPassenger = () => {
    if (fields.length < maxQuantity) {
      append({ fullName: '', dateOfBirth: '', idNumber: '' });
    }
  };
  const handleApplyVoucher = () => {
    if (voucherCode.trim()) {
      setVoucherApplied(true);
    }
  };
  const handleFormSubmit = (data: TourBookingFormData) => {
    onSubmit({
      ...data,
      voucherCode: voucherApplied ? voucherCode : undefined,
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-brand-500" />
          Thông Tin Đặt Tour
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="quantity" className="text-sm font-medium">
              Số lượng khách <span className="text-error-500">*</span>
            </label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={maxQuantity}
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity && <p className="text-sm text-error-500">{errors.quantity.message}</p>}
            <p className="text-xs text-neutral-500">Còn {maxQuantity} chỗ trống</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Thông tin hành khách <span className="text-error-500">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPassenger}
                disabled={fields.length >= maxQuantity}
              >
                <Plus className="mr-1 h-4 w-4" />
                Thêm
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id} className="bg-neutral-50">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Khách {index + 1}</span>
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-error-500" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <div>
                      <Input
                        placeholder="Họ và tên *"
                        {...register(`passengers.${index}.fullName`)}
                      />
                      {errors.passengers?.[index]?.fullName && (
                        <p className="mt-1 text-xs text-error-500">
                          {errors.passengers[index]?.fullName?.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Input
                          type="date"
                          placeholder="Ngày sinh"
                          {...register(`passengers.${index}.dateOfBirth`)}
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Số CMND/CCCD"
                          {...register(`passengers.${index}.idNumber`)}
                        />
                        {errors.passengers?.[index]?.idNumber && (
                          <p className="mt-1 text-xs text-error-500">
                            {errors.passengers[index]?.idNumber?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {errors.passengers &&
              typeof errors.passengers === 'object' &&
              'message' in errors.passengers && (
                <p className="text-sm text-error-500">{errors.passengers.message}</p>
              )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mã giảm giá</label>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập mã giảm giá"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                disabled={voucherApplied}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyVoucher}
                disabled={!voucherCode.trim() || voucherApplied}
              >
                {voucherApplied ? 'Đã áp dụng' : 'Áp dụng'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              Ghi chú
            </label>
            <textarea
              id="note"
              className="min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Yêu cầu đặc biệt, thông tin thêm..."
              {...register('note')}
            />
            {errors.note && <p className="text-sm text-error-500">{errors.note.message}</p>}
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Đơn giá</span>
              <span>{formatCurrency(price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Số lượng</span>
              <span>x {quantity}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-semibold">
              <span>Tổng cộng</span>
              <span className="text-brand-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Tiến Hành Đặt Tour'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
