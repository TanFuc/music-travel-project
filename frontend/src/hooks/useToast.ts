'use client';
import { toast as sonnerToast } from 'sonner';
type ToastType = 'success' | 'error' | 'info' | 'warning';
interface ToastOptions {
  duration?: number;
  description?: string;
}
const toastMessages: Record<string, string> = {
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  LOGOUT_SUCCESS: 'Đăng xuất thành công!',
  REGISTER_SUCCESS: 'Đăng ký thành công!',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  BOOKING_SUCCESS: 'Đặt vé thành công!',
  BOOKING_CANCELLED: 'Đã hủy đơn hàng.',
  TICKETS_LOCKED: 'Đã giữ vé thành công. Vui lòng thanh toán trong thời gian quy định.',
  LOCK_EXPIRED: 'Thời gian giữ vé đã hết. Vui lòng chọn lại.',
  PAYMENT_SUCCESS: 'Thanh toán thành công!',
  PAYMENT_FAILED: 'Thanh toán thất bại. Vui lòng thử lại.',
  INSUFFICIENT_BALANCE: 'Số dư ví không đủ.',
  ADDED_TO_CART: 'Đã thêm vào giỏ hàng.',
  REMOVED_FROM_CART: 'Đã xóa khỏi giỏ hàng.',
  CART_CLEARED: 'Đã xóa toàn bộ giỏ hàng.',
  VOUCHER_APPLIED: 'Áp dụng mã giảm giá thành công!',
  VOUCHER_INVALID: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.',
  OPERATION_SUCCESS: 'Thao tác thành công!',
  OPERATION_FAILED: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
  NETWORK_ERROR: 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.',
};
export function useToast() {
  const show = (type: ToastType, messageKey: string, options?: ToastOptions) => {
    const message = toastMessages[messageKey] || messageKey;
    switch (type) {
      case 'success':
        sonnerToast.success(message, {
          duration: options?.duration ?? 3000,
          description: options?.description,
        });
        break;
      case 'error':
        sonnerToast.error(message, {
          duration: options?.duration ?? 5000,
          description: options?.description,
        });
        break;
      case 'info':
        sonnerToast.info(message, {
          duration: options?.duration ?? 3000,
          description: options?.description,
        });
        break;
      case 'warning':
        sonnerToast.warning(message, {
          duration: options?.duration ?? 4000,
          description: options?.description,
        });
        break;
    }
  };
  return {
    success: (messageKey: string, options?: ToastOptions) => show('success', messageKey, options),
    error: (messageKey: string, options?: ToastOptions) => show('error', messageKey, options),
    info: (messageKey: string, options?: ToastOptions) => show('info', messageKey, options),
    warning: (messageKey: string, options?: ToastOptions) => show('warning', messageKey, options),
    toast: sonnerToast,
  };
}
