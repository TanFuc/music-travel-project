export const ERROR_CODES = {
  // Authentication
  AUTH_001: 'AUTH_001',
  AUTH_002: 'AUTH_002',
  AUTH_003: 'AUTH_003',
  AUTH_004: 'AUTH_004',

  // User
  USER_001: 'USER_001',
  USER_002: 'USER_002',
  USER_003: 'USER_003',

  // Show & Ticket
  SHOW_001: 'SHOW_001',
  SHOW_002: 'SHOW_002',
  TICKET_001: 'TICKET_001',
  TICKET_002: 'TICKET_002',
  TICKET_003: 'TICKET_003',

  // Tour
  TOUR_001: 'TOUR_001',
  TOUR_002: 'TOUR_002',

  // Booking
  BOOKING_001: 'BOOKING_001',
  BOOKING_002: 'BOOKING_002',
  BOOKING_003: 'BOOKING_003',

  // Payment
  PAYMENT_001: 'PAYMENT_001',
  PAYMENT_002: 'PAYMENT_002',
  PAYMENT_003: 'PAYMENT_003',

  // Validation
  VAL_001: 'VAL_001',
  VAL_002: 'VAL_002',
  VAL_003: 'VAL_003',
  VAL_004: 'VAL_004',

  // System
  SYS_001: 'SYS_001',
  SYS_002: 'SYS_002',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Authentication
  AUTH_001: 'Số điện thoại hoặc mật khẩu không đúng.',
  AUTH_002: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  AUTH_003: 'Bạn không có quyền truy cập tài nguyên này.',
  AUTH_004: 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.',

  // User
  USER_001: 'Không tìm thấy người dùng này.',
  USER_002: 'Số điện thoại đã được đăng ký.',
  USER_003: 'Email đã được sử dụng.',

  // Show & Ticket
  SHOW_001: 'Không tìm thấy sự kiện.',
  SHOW_002: 'Sự kiện đã kết thúc hoặc bị hủy.',
  TICKET_001: 'Vé đã được bán hoặc đang giữ.',
  TICKET_002: 'Thời gian giữ vé đã hết. Vui lòng chọn lại.',
  TICKET_003: 'Không đủ vé cho yêu cầu của bạn.',

  // Tour
  TOUR_001: 'Không tìm thấy tour.',
  TOUR_002: 'Lịch khởi hành đã đầy chỗ.',

  // Booking
  BOOKING_001: 'Không tìm thấy đơn hàng.',
  BOOKING_002: 'Đơn hàng đã bị hủy.',
  BOOKING_003: 'Không thể hủy đơn hàng đã thanh toán.',

  // Payment
  PAYMENT_001: 'Thanh toán thất bại. Vui lòng thử lại.',
  PAYMENT_002: 'Số dư ví không đủ.',
  PAYMENT_003: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.',

  // Validation
  VAL_001: 'Dữ liệu không hợp lệ.',
  VAL_002: 'Email không đúng định dạng.',
  VAL_003: 'Số điện thoại không hợp lệ.',
  VAL_004: 'Mật khẩu phải có ít nhất 8 ký tự.',

  // System
  SYS_001: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
  SYS_002: 'Hệ thống đang bảo trì. Vui lòng quay lại sau.',
};

export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.SYS_001;
}
