/**
 * Redis Cache Key Strategy
 *
 * Key Format: {prefix}:{domain}:{identifier}:{sub-identifier}
 *
 * Examples:
 * - app:user:123 (single user)
 * - app:show:list:page_1_limit_10 (paginated list)
 * - app:ticket:lock:456 (ticket lock)
 * - app:session:user_123 (user session)
 */

// Application prefix - prevents collision with other apps using same Redis
export const CACHE_PREFIX = 'mtravel';

// Domain prefixes
export const CACHE_DOMAINS = {
  USER: 'user',
  AUTH: 'auth',
  SHOW: 'show',
  TOUR: 'tour',
  TICKET: 'ticket',
  BOOKING: 'booking',
  VOUCHER: 'voucher',
  WALLET: 'wallet',
  NOTIFICATION: 'notification',
  MEDIA: 'media',
  LOCATION: 'location',
  STAGE: 'stage',
  ARTIST: 'artist',
} as const;

// TTL values in seconds
export const CACHE_TTL = {
  // Short-lived cache (1-5 minutes)
  VERY_SHORT: 60, // 1 minute
  SHORT: 300, // 5 minutes

  // Medium-lived cache (10-30 minutes)
  MEDIUM: 600, // 10 minutes
  STANDARD: 1800, // 30 minutes

  // Long-lived cache (1-24 hours)
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours

  // Specific TTLs
  USER_SESSION: 604800, // 7 days
  REFRESH_TOKEN: 2592000, // 30 days
  TICKET_LOCK: 600, // 10 minutes for ticket reservation
  OTP: 300, // 5 minutes for OTP
  RATE_LIMIT: 60, // 1 minute for rate limiting
  TOKEN_BLACKLIST: 86400, // 24 hours for blacklisted tokens
  QR_NONCE: 900, // 15 minutes for QR replay prevention
  WEBHOOK_IDEMPOTENCY: 86400, // 24 hours for webhook idempotency
} as const;

// Cache key generators
export const CacheKeys = {
  // === AUTH ===
  refreshToken: (userId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.AUTH}:refresh:${userId}`,
  userSession: (userId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.AUTH}:session:${userId}`,
  loginAttempts: (identifier: string) =>
    `${CACHE_PREFIX}:${CACHE_DOMAINS.AUTH}:attempts:${identifier}`,
  otp: (phoneNumber: string) => `${CACHE_PREFIX}:${CACHE_DOMAINS.AUTH}:otp:${phoneNumber}`,
  tokenBlacklist: (token: string) =>
    `${CACHE_PREFIX}:${CACHE_DOMAINS.AUTH}:blacklist:${token.slice(-16)}`,

  // === USER ===
  user: (userId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.USER}:${userId}`,
  userByPhone: (phone: string) => `${CACHE_PREFIX}:${CACHE_DOMAINS.USER}:phone:${phone}`,
  userProfile: (userId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.USER}:profile:${userId}`,

  // === SHOW ===
  show: (showId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.SHOW}:${showId}`,
  showBySlug: (slug: string) => `${CACHE_PREFIX}:${CACHE_DOMAINS.SHOW}:slug:${slug}`,
  showList: (filters: string) => `${CACHE_PREFIX}:${CACHE_DOMAINS.SHOW}:list:${filters}`,
  showSeatMap: (showId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.SHOW}:seatmap:${showId}`,
  showTicketClasses: (showId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.SHOW}:classes:${showId}`,
  upcomingShows: () => `${CACHE_PREFIX}:${CACHE_DOMAINS.SHOW}:upcoming`,

  // === TOUR ===
  tour: (tourId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.TOUR}:${tourId}`,
  tourBySlug: (slug: string) => `${CACHE_PREFIX}:${CACHE_DOMAINS.TOUR}:slug:${slug}`,
  tourList: (filters: string) => `${CACHE_PREFIX}:${CACHE_DOMAINS.TOUR}:list:${filters}`,
  tourSchedules: (tourId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.TOUR}:schedules:${tourId}`,

  // === TICKET ===
  ticket: (ticketId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.TICKET}:${ticketId}`,
  ticketLock: (lockId: string) => `${CACHE_PREFIX}:${CACHE_DOMAINS.TICKET}:lock:${lockId}`,
  ticketsByShow: (showId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.TICKET}:show:${showId}`,
  availableTickets: (showId: number, classId: number) =>
    `${CACHE_PREFIX}:${CACHE_DOMAINS.TICKET}:available:${showId}:${classId}`,
  qrNonce: (ticketId: number, iat: number) =>
    `${CACHE_PREFIX}:${CACHE_DOMAINS.TICKET}:qr:nonce:${ticketId}:${iat}`,

  // === WEBHOOK ===
  webhookIdempotency: (gateway: string, transId: string) =>
    `${CACHE_PREFIX}:webhook:${gateway}:${transId}`,

  // === BOOKING ===
  booking: (bookingId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.BOOKING}:${bookingId}`,
  bookingByCode: (code: string) => `${CACHE_PREFIX}:${CACHE_DOMAINS.BOOKING}:code:${code}`,
  userBookings: (userId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.BOOKING}:user:${userId}`,

  // === VOUCHER ===
  voucher: (voucherId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.VOUCHER}:${voucherId}`,
  voucherByCode: (code: string) => `${CACHE_PREFIX}:${CACHE_DOMAINS.VOUCHER}:code:${code}`,
  voucherList: () => `${CACHE_PREFIX}:${CACHE_DOMAINS.VOUCHER}:list`,
  activeVouchers: () => `${CACHE_PREFIX}:${CACHE_DOMAINS.VOUCHER}:active`,

  // === WALLET ===
  wallet: (userId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.WALLET}:${userId}`,
  userWallet: (userId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.WALLET}:user:${userId}`,
  walletTransactions: (userId: number, page: number) =>
    `${CACHE_PREFIX}:${CACHE_DOMAINS.WALLET}:transactions:${userId}:${page}`,

  // === NOTIFICATION ===
  userNotifications: (userId: number) =>
    `${CACHE_PREFIX}:${CACHE_DOMAINS.NOTIFICATION}:user:${userId}`,
  unreadCount: (userId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.NOTIFICATION}:unread:${userId}`,

  // === LOCATION/STAGE/ARTIST (Master Data) ===
  locations: () => `${CACHE_PREFIX}:${CACHE_DOMAINS.LOCATION}:all`,
  location: (slug: string) => `${CACHE_PREFIX}:${CACHE_DOMAINS.LOCATION}:${slug}`,
  stages: () => `${CACHE_PREFIX}:${CACHE_DOMAINS.STAGE}:all`,
  stagesByLocation: (locationId: number) =>
    `${CACHE_PREFIX}:${CACHE_DOMAINS.STAGE}:location:${locationId}`,
  stage: (stageId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.STAGE}:${stageId}`,
  artists: () => `${CACHE_PREFIX}:${CACHE_DOMAINS.ARTIST}:all`,
  artist: (artistId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.ARTIST}:${artistId}`,

  // === BANNER ===
  bannersByPosition: (position: string) => `${CACHE_PREFIX}:banner:position:${position}`,
} as const;

// Pattern generators for bulk invalidation
export const CachePatterns = {
  allUserData: (userId: number) => `${CACHE_PREFIX}:*:*${userId}*`,
  allShowData: (showId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.SHOW}:*${showId}*`,
  allTourData: (tourId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.TOUR}:*${tourId}*`,
  allTicketData: (ticketId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.TICKET}:*${ticketId}*`,
  allBookingData: (bookingId: number) => `${CACHE_PREFIX}:${CACHE_DOMAINS.BOOKING}:*${bookingId}*`,
  allVoucherData: () => `${CACHE_PREFIX}:${CACHE_DOMAINS.VOUCHER}:*`,
  showLists: () => `${CACHE_PREFIX}:${CACHE_DOMAINS.SHOW}:list:*`,
  tourLists: () => `${CACHE_PREFIX}:${CACHE_DOMAINS.TOUR}:list:*`,
  voucherLists: () => `${CACHE_PREFIX}:${CACHE_DOMAINS.VOUCHER}:list*`,
} as const;

// Helper to generate filter hash for list caching
export function generateFilterHash(filters: Record<string, unknown>): string {
  const sortedKeys = Object.keys(filters).sort();
  const parts = sortedKeys
    .filter((key) => filters[key] !== undefined && filters[key] !== null && filters[key] !== '')
    .map((key) => `${key}_${filters[key]}`);
  return parts.length > 0 ? parts.join('_') : 'all';
}
