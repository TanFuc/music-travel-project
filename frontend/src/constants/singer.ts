export const STATUS_FILTER_OPTIONS = [
  { value: '__all__', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'CANCELLED', label: 'Đã hủy' },
] as const;

export const EXPERIENCE_FILTER_OPTIONS = [
  { value: '__all__', label: 'Tất cả mức độ' },
  { value: 'NONE', label: 'Chưa có kinh nghiệm' },
  { value: 'HOBBY', label: 'Hát theo sở thích' },
  { value: 'SEMI_PROFESSIONAL', label: 'Bán chuyên nghiệp' },
  { value: 'PROFESSIONAL', label: 'Chuyên nghiệp' },
] as const;

export const LIMIT_OPTIONS = [
  { value: 10, label: '10 mục' },
  { value: 25, label: '25 mục' },
  { value: 50, label: '50 mục' },
] as const;

export const STATUS_UPDATE_OPTIONS = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'CANCELLED', label: 'Đã hủy' },
] as const;

