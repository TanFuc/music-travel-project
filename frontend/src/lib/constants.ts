// Application constants

export const APP_NAME = 'Mãi Cho Hành Tinh Xanh';

// Route to title mappings for static pages
export const ROUTE_TITLES: Record<string, string> = {
  // Main pages
  '/': 'Trang Chủ',
  '/shows': 'Show Diễn',
  '/tours': 'Tour Du Lịch',
  '/tickets': 'Mua Vé',
  '/cart': 'Giỏ Hàng',
  '/checkout': 'Thanh Toán',
  '/profile': 'Tài Khoản',
  '/search': 'Tìm Kiếm',
  '/register-performance': 'Đăng Ký Biểu Diễn',

  // Auth pages
  '/login': 'Đăng Nhập',
  '/register': 'Đăng Ký',

  // Admin pages
  '/admin': 'Quản Trị',
  '/admin/dashboard': 'Tổng Quan',
  '/admin/users': 'Người Dùng',
  '/admin/shows': 'Quản Lý Show',
  '/admin/tours': 'Quản Lý Tour',
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
};

// Helper to format page title with app name
export function formatPageTitle(pageTitle: string): string {
  return `${pageTitle} | ${APP_NAME}`;
}

// Helper to get title from route, with fallback support
export function getTitleFromRoute(pathname: string): string | null {
  // Direct match
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname];
  }

  // Check for admin dynamic routes
  if (pathname.startsWith('/admin/shows/') && pathname.includes('/qr-codes')) {
    return 'Mã QR Check-in';
  }
  if (pathname.startsWith('/admin/shows/') && pathname.includes('/registrations')) {
    return 'Danh Sách Đăng Ký';
  }
  if (pathname.startsWith('/admin/stages/') && pathname.includes('/seat-map')) {
    return 'Sơ Đồ Chỗ Ngồi';
  }
  if (pathname.startsWith('/admin/banners/')) {
    return 'Chi Tiết Banner';
  }
  if (pathname.startsWith('/admin/home-stages/')) {
    return 'Chi Tiết Sân Khấu';
  }
  if (pathname.startsWith('/admin/shows/')) {
    return 'Chi Tiết Show';
  }

  return null;
}
