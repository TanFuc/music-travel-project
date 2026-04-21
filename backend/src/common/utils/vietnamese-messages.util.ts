export const VIETNAMESE_MESSAGES = {
  required: (field: string) => `${field} không được để trống.`,
  invalid: (field: string) => `${field} không hợp lệ.`,
  minLength: (field: string, min: number) => `${field} phải có ít nhất ${min} ký tự.`,
  maxLength: (field: string, max: number) => `${field} không được vượt quá ${max} ký tự.`,
  min: (field: string, min: number) => `${field} phải lớn hơn hoặc bằng ${min}.`,
  max: (field: string, max: number) => `${field} phải nhỏ hơn hoặc bằng ${max}.`,
  isNumber: (field: string) => `${field} phải là số.`,
  isInt: (field: string) => `${field} phải là số nguyên.`,
  isPositive: (field: string) => `${field} phải là số dương.`,
  isEmail: () => 'Email không đúng định dạng.',
  isPhoneNumber: () => 'Số điện thoại không hợp lệ.',
  isDate: (field: string) => `${field} phải là ngày hợp lệ.`,
  minDate: (field: string, date: string) => `${field} phải sau ngày ${date}.`,
  maxDate: (field: string, date: string) => `${field} phải trước ngày ${date}.`,
  isArray: (field: string) => `${field} phải là một danh sách.`,
  arrayMinSize: (field: string, min: number) => `${field} phải có ít nhất ${min} phần tử.`,
  arrayMaxSize: (field: string, max: number) => `${field} không được vượt quá ${max} phần tử.`,
  isEnum: (field: string, values: string[]) =>
    `${field} phải là một trong các giá trị: ${values.join(', ')}.`,
  isBoolean: (field: string) => `${field} phải là true hoặc false.`,
  isUUID: (field: string) => `${field} phải là UUID hợp lệ.`,
  isObject: (field: string) => `${field} phải là một đối tượng.`,
  passwordTooWeak: () => 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.',
  passwordMismatch: () => 'Mật khẩu xác nhận không khớp.',
  phoneNumberFormat: () => 'Số điện thoại phải bắt đầu bằng 0 và có 10-11 chữ số.',
};
export function isVietnamesePhoneNumber(phone: string): boolean {
  const phoneRegex = /^0[3-9]\d{8,9}$/;
  return phoneRegex.test(phone);
}
export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
export function formatDateVN(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
