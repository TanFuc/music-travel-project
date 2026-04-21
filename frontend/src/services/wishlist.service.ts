import { get, post } from '@/lib/api';
export enum WishlistTargetType {
  SHOW = 'SHOW',
  TOUR = 'TOUR',
}
export interface ToggleWishlistDto {
  targetType: WishlistTargetType;
  targetId: number;
}
export interface WishlistStatus {
  isWishlisted: boolean;
}
export interface WishlistItem {
  userId: number;
  targetType: WishlistTargetType;
  targetId: number;
  createdAt: string;
  details: any;
}
export const wishlistService = {
  getMyWishlist: async () => {
    return get<WishlistItem[]>('/wishlists');
  },
  toggleWishlist: async (data: ToggleWishlistDto) => {
    return post<WishlistStatus>('/wishlists/toggle', data);
  },
  checkStatus: async (targetType: WishlistTargetType, targetId: number) => {
    return get<WishlistStatus>(`/wishlists/check?targetType=${targetType}&targetId=${targetId}`);
  },
};
