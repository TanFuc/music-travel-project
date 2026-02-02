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

  // Check-in
  CHECKIN_001: 'CHECKIN_001',
  CHECKIN_002: 'CHECKIN_002',
  CHECKIN_003: 'CHECKIN_003',
  CHECKIN_004: 'CHECKIN_004',
  CHECKIN_005: 'CHECKIN_005',
  CHECKIN_006: 'CHECKIN_006',

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
  PAYMENT_004: 'PAYMENT_004',
  PAYMENT_005: 'PAYMENT_005',
  PAYMENT_006: 'PAYMENT_006',

  // Stage
  STAGE_001: 'STAGE_001',
  STAGE_002: 'STAGE_002',

  // Seat
  SEAT_001: 'SEAT_001',
  SEAT_002: 'SEAT_002',

  // Location
  LOCATION_001: 'LOCATION_001',

  // Template
  TEMPLATE_001: 'TEMPLATE_001',

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
  SHOW_001: 'Không tìm thấy show diễn.',
  SHOW_002: 'Show diễn đã kết thúc hoặc bị hủy.',
  TICKET_001: 'Vé đã được bán hoặc đang giữ.',
  TICKET_002: 'Thời gian giữ vé đã hết. Vui lòng chọn lại.',
  TICKET_003: 'Không đủ vé cho yêu cầu của bạn.',

  // Check-in
  CHECKIN_001: 'Mã QR không hợp lệ.',
  CHECKIN_002: 'Chữ ký QR không hợp lệ.',
  CHECKIN_003: 'Vé đã được check-in trước đó.',
  CHECKIN_004: 'Chưa đến thời gian check-in.',
  CHECKIN_005: 'Mã QR đã hết hạn hoặc đã được sử dụng.',
  CHECKIN_006: 'Vé không tồn tại hoặc chưa được thanh toán.',

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
  PAYMENT_004: 'Số tiền thanh toán không khớp. Vui lòng liên hệ hỗ trợ.',
  PAYMENT_005: 'Hoàn tiền thất bại. Vui lòng thử lại.',
  PAYMENT_006: 'Đơn hàng đã được thanh toán trước đó.',

  // Stage
  STAGE_001: 'Sân khấu không tồn tại.',
  STAGE_002: 'Không thể xóa sân khấu đã có show.',

  // Seat
  SEAT_001: 'Chỗ ngồi không tồn tại hoặc không thuộc sân khấu này.',
  SEAT_002: 'Chỗ ngồi đã được đặt.',

  // Location
  LOCATION_001: 'Địa điểm không tồn tại.',

  // Template
  TEMPLATE_001: 'Template sơ đồ chỗ ngồi không tồn tại.',

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
