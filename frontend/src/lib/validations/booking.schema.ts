import { z } from 'zod';
export const passengerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Vui lòng nhập họ tên')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự'),
  dateOfBirth: z.string().optional(),
  idNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{9,12}$/.test(val), 'Số CMND/CCCD phải có từ 9-12 chữ số'),
});
export const tourBookingSchema = z.object({
  tourScheduleId: z.number().min(1, 'Vui lòng chọn lịch khởi hành'),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0').max(20, 'Tối đa 20 khách'),
  passengers: z.array(passengerSchema).min(1, 'Vui lòng nhập thông tin hành khách'),
  voucherCode: z.string().optional(),
  note: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional(),
});
export const ticketBookingSchema = z.object({
  ticketIds: z.array(z.number()).min(1, 'Vui lòng chọn ít nhất 1 vé'),
  voucherCode: z.string().optional(),
  note: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional(),
});
export const voucherSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã giảm giá').max(50, 'Mã giảm giá không hợp lệ'),
});
export type PassengerFormData = z.infer<typeof passengerSchema>;
export type TourBookingFormData = z.infer<typeof tourBookingSchema>;
export type TicketBookingFormData = z.infer<typeof ticketBookingSchema>;
export type VoucherFormData = z.infer<typeof voucherSchema>;
