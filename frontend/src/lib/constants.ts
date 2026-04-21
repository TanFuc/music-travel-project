export const APP_NAME = 'Mãi Cho Hành Tinh Xanh';
export const ROUTE_TITLES: Record<string, string> = {
  '/': 'Trang Chủ',
  '/about': 'Giới Thiệu',
  '/shows': 'Show Diễn',
  '/tours': 'Tour Du Lịch',
  '/tickets': 'Mua Vé',
  '/cart': 'Giỏ Hàng',
  '/checkout': 'Thanh Toán',
  '/profile': 'Tài Khoản',
  '/search': 'Tìm Kiếm',
  '/register-singer': 'Đăng Ký Ca Sĩ',
  '/collaborator/register': 'Đăng Ký Cộng Tác Viên',
  '/collaborator/dashboard': 'Bảng Điều Khiển Cộng Tác Viên',
  '/register-performance': 'Đăng Ký Biểu Diễn',
  '/payment-demo': 'Thanh Toán Thử Nghiệm',
  '/login': 'Đăng Nhập',
  '/register': 'Đăng Ký',
  '/admin': 'Quản Trị',
  '/admin/dashboard': 'Tổng Quan',
  '/admin/users': 'Người Dùng',
  '/admin/shows': 'Quản Lý Show',
  '/admin/tours': 'Quản Lý Tour',
  '/admin/support': 'Hỗ Trợ',
  '/admin/stages': 'Sân Khấu',
  '/admin/home-stages': 'Sân Khấu Trang Chủ',
  '/admin/home-stages/create': 'Tạo Sân Khấu Mới',
  '/admin/tickets': 'Quản Lý Vé',
  '/admin/ticket-tiers': 'Loại Vé Bán',
  '/admin/bookings': 'Đơn Hàng',
  '/admin/payments': 'Thanh Toán',
  '/admin/vouchers': 'Voucher',
  '/admin/media': 'Media',
  '/admin/banners': 'Banner',
  '/admin/banners/create': 'Tạo Banner',
  '/admin/notifications': 'Thông Báo',
  '/admin/settings': 'Cài Đặt',
  '/admin/branches': 'Chi Nhánh',
  '/admin/singer-registrations': 'Đăng Ký Ca Sĩ',
  '/admin/singer-packages': 'Gói Ca Sĩ',
  '/admin/contact-channels': 'Kênh Liên Hệ',
  '/admin/system/audit-logs': 'Nhật Ký Hệ Thống',
};
export function formatPageTitle(pageTitle: string): string {
  return `${pageTitle} | ${APP_NAME}`;
}
export function getTitleFromRoute(pathname: string): string | null {
  const normalizedPath = pathname === '/' ? pathname : pathname.replace(/\/+$/, '');
  if (ROUTE_TITLES[normalizedPath]) {
    return ROUTE_TITLES[normalizedPath];
  }
  if (normalizedPath.startsWith('/shows/')) {
    if (normalizedPath.includes('/queue')) {
      return 'Hàng Chờ Check-in Show';
    }
    return 'Chi Tiết Show';
  }
  if (normalizedPath.startsWith('/tours/')) {
    return 'Chi Tiết Tour';
  }
  if (normalizedPath.startsWith('/profile/bookings/')) {
    return 'Chi Tiết Đơn Hàng';
  }
  if (normalizedPath.startsWith('/admin/shows/') && normalizedPath.includes('/qr-codes')) {
    return 'Mã QR Check-in';
  }
  if (normalizedPath.startsWith('/admin/shows/') && normalizedPath.includes('/registrations')) {
    return 'Danh Sách Đăng Ký';
  }
  if (normalizedPath.startsWith('/admin/shows/') && normalizedPath.includes('/analytics')) {
    return 'Phân Tích Show';
  }
  if (normalizedPath.startsWith('/admin/shows/') && normalizedPath.includes('/check-in')) {
    return 'Check-in Show';
  }
  if (normalizedPath.startsWith('/admin/shows/') && normalizedPath.includes('/activity-log')) {
    return 'Nhật Ký Hoạt Động Show';
  }
  if (normalizedPath.startsWith('/admin/stages/') && normalizedPath.includes('/seat-map')) {
    return 'Sơ Đồ Chỗ Ngồi';
  }
  if (normalizedPath.startsWith('/admin/banners/')) {
    return 'Chi Tiết Banner';
  }
  if (normalizedPath.startsWith('/admin/home-stages/')) {
    return 'Chi Tiết Sân Khấu';
  }
  if (normalizedPath.startsWith('/admin/shows/')) {
    return 'Chi Tiết Show';
  }
  const segmentLabels: Record<string, string> = {
    admin: 'Quản Trị',
    main: 'Trang Chính',
    auth: 'Xác Thực',
    shows: 'Show Diễn',
    tours: 'Tour Du Lịch',
    tickets: 'Vé',
    profile: 'Tài Khoản',
    bookings: 'Đơn Hàng',
    collaborator: 'Cộng Tác Viên',
    dashboard: 'Bảng Điều Khiển',
    settings: 'Cài Đặt',
    users: 'Người Dùng',
    notifications: 'Thông Báo',
    media: 'Media',
    banners: 'Banner',
    payment: 'Thanh Toán',
    payments: 'Thanh Toán',
    search: 'Tìm Kiếm',
    about: 'Giới Thiệu',
  };
  const segments = normalizedPath
    .split('/')
    .filter(Boolean)
    .filter((segment) => !/^\d+$/.test(segment))
    .filter((segment) => !/^[a-f0-9-]{8,}$/i.test(segment));
  if (segments.length === 0) {
    return ROUTE_TITLES['/'];
  }
  const friendlyTitle = segments
    .map((segment) => {
      if (segmentLabels[segment]) {
        return segmentLabels[segment];
      }
      return segment.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    })
    .join(' - ')
    .trim();
  return friendlyTitle || null;
}
