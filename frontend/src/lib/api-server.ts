const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
interface FetchOptions {
    revalidate?: number | false;
    tags?: string[];
    cache?: RequestCache;
}
interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message: string;
    code: string;
    timestamp: string;
    path: string;
}
interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export async function fetchServer<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { revalidate = 180, tags, cache } = options;
    const url = `${API_URL}${endpoint}`;
    try {
        const fetchOptions: RequestInit & {
            next?: {
                revalidate?: number | false;
                tags?: string[];
            };
        } = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (cache) {
            fetchOptions.cache = cache;
        }
        else if (revalidate !== undefined) {
            fetchOptions.next = {
                revalidate,
                tags,
            };
        }
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
            const apiResponse = data as ApiResponse<T> & {
                meta?: PaginatedApiResponse<T>['meta'];
            };
            if (!apiResponse.success) {
                throw new Error(apiResponse.message || 'API Error');
            }
            if (apiResponse.meta) {
                return { items: apiResponse.data, meta: apiResponse.meta } as T;
            }
            return apiResponse.data as T;
        }
        return data as T;
    }
    catch (error) {
        throw error;
    }
}
export interface Banner {
    id: number;
    title: string;
    imageUrl: string;
    mobileImageUrl?: string;
    actionLink: string;
}
export interface Show {
    id: number;
    title: string;
    slug: string;
    description?: string;
    thumbnailUrl?: string;
    performTime: string;
    status: string;
    stage: {
        id: number;
        name: string;
        branch?: {
            name: string;
        };
        location?: {
            name: string;
        };
    };
    minPrice: number | null;
    availableTickets?: number;
    badges?: ('HOT' | 'VIP' | 'NEW' | 'SOLD_OUT' | 'SOON')[];
    ticketClasses?: TicketClass[];
    ticketTiers?: TicketTier[];
    seatSelectionEnabled?: boolean;
}
export interface TicketClass {
    id: number;
    name: string;
    price: number;
    description?: string;
    available: number;
}
export interface TicketTier {
    id: number;
    name: string;
    price: number;
    description?: string;
    available: number;
}
export interface Tour {
    id: number;
    title: string;
    slug: string;
    description?: string;
    thumbnailUrl?: string;
    duration: string;
    departureLoc: {
        name: string;
    };
    destinationLoc: {
        name: string;
    };
    minPrice: number | null;
    nextSchedule?: {
        startDate: string;
        price: number;
        availableSlots: number;
    };
}
export interface HomeStage {
    id: number;
    title: string;
    imageUrl: string;
    description?: string;
    location?: string | {
        name: string;
    };
}
export interface Location {
    id: number;
    name: string;
    slug: string;
    showCount?: number;
}
export interface PaginatedData<T> {
    items: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface DashboardStats {
    users: {
        total: number;
        newThisMonth: number;
    };
    shows: {
        total: number;
        upcoming: number;
    };
    tours: {
        total: number;
        activeSchedules: number;
    };
    bookings: {
        total: number;
        pendingCount: number;
        totalRevenue: number;
        revenueThisMonth: number;
    };
}
export interface BookingItem {
    id: number;
    itemType: string;
    quantity: number;
    originalPrice: number;
    ticket?: {
        id: number;
        show?: {
            id: number;
            title: string;
        };
    };
    tourSchedule?: {
        id: number;
        tour?: {
            id: number;
            title: string;
        };
    };
}
export interface RecentBooking {
    id: number;
    bookingCode: string;
    user: {
        fullName: string;
        phoneNumber: string;
    };
    totalAmount: number;
    finalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    items: BookingItem[];
}
export const serverAPI = {
    admin: {
        getDashboardStats: () => fetchServer<DashboardStats>('/admin/dashboard', {
            revalidate: 60,
            tags: ['admin-stats'],
        }),
        getRecentBookings: (limit = 10) => fetchServer<{
            items: RecentBooking[];
        }>(`/admin/recent-bookings?limit=${limit}`, {
            revalidate: 30,
            tags: ['admin-bookings'],
        }),
    },
    banners: {
        getHomeBanners: () => fetchServer<Banner[]>('/banners?position=HOME_MAIN_SLIDER&isActive=true', {
            revalidate: 300,
            tags: ['banners'],
        }),
    },
    shows: {
        getAll: (params?: Record<string, string | number>) => {
            const searchParams = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    searchParams.set(key, String(value));
                });
            }
            return fetchServer<PaginatedData<Show>>(`/shows?${searchParams}`, {
                revalidate: 180,
                tags: ['shows'],
            });
        },
        getBySlug: (slug: string) => fetchServer<Show>(`/shows/${slug}`, {
            revalidate: 300,
            tags: [`show-${slug}`],
        }),
        getHomeShows: (locationFilter?: string) => {
            const params = new URLSearchParams({
                limit: '100',
                status: 'UPCOMING',
            });
            if (locationFilter) {
                params.append('location', locationFilter);
            }
            return fetchServer<PaginatedData<Show>>(`/shows?${params}`, {
                revalidate: 180,
                tags: ['shows', 'home-shows'],
            });
        },
    },
    tours: {
        getAll: (params?: Record<string, string | number>) => {
            const searchParams = new URLSearchParams();
            searchParams.set('isCombo', 'false');
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    searchParams.set(key, String(value));
                });
            }
            return fetchServer<PaginatedData<Tour>>(`/tours?${searchParams}`, {
                revalidate: 180,
                tags: ['tours'],
            });
        },
        getBySlug: (slug: string) => fetchServer<Tour>(`/tours/${slug}`, {
            revalidate: 300,
            tags: [`tour-${slug}`],
        }),
        getHomeTours: () => fetchServer<PaginatedData<Tour>>('/tours?isCombo=false&limit=2', {
            revalidate: 300,
            tags: ['tours', 'home-tours'],
        }),
    },
    combos: {
        getAll: (params?: Record<string, string | number>) => {
            const searchParams = new URLSearchParams();
            searchParams.set('isCombo', 'true');
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    searchParams.set(key, String(value));
                });
            }
            return fetchServer<PaginatedData<Tour>>(`/tours?${searchParams}`, {
                revalidate: 180,
                tags: ['combos'],
            });
        },
        getBySlug: (slug: string) => fetchServer<Tour>(`/combos/${slug}`, {
            revalidate: 300,
            tags: [`combo-${slug}`],
        }),
        getHomeCombos: () => fetchServer<PaginatedData<Tour>>('/combos?limit=2', {
            revalidate: 300,
            tags: ['combos', 'home-combos'],
        }),
    },
    stages: {
        getHomeStages: () => fetchServer<HomeStage[]>('/home-stages?activeOnly=true', {
            revalidate: 300,
            tags: ['stages', 'home-stages'],
        }),
    },
    locations: {
        getAll: () => fetchServer<Location[]>('/locations', {
            revalidate: 3600,
            tags: ['locations'],
        }),
    },
    search: {
        query: (q: string, type?: string) => {
            const params = new URLSearchParams({ q });
            if (type && type !== 'all') {
                params.set('type', type);
            }
            return fetchServer<{
                shows: Show[];
                tours: Tour[];
                stages: HomeStage[];
            }>(`/search?${params}`, {
                cache: 'no-store',
            });
        },
    },
};
export default serverAPI;
