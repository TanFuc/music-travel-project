'use client';
import { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { wishlistService, WishlistTargetType } from '@/services/wishlist.service';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
interface WishlistButtonProps {
  showId: number;
  showTitle: string;
  className?: string;
}
export function WishlistButton({ showId, showTitle, className }: WishlistButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const { data: wishlistItems = [] } = useQuery({
    queryKey: ['my-wishlist', user?.id],
    queryFn: () => wishlistService.getMyWishlist(),
    enabled: isAuthenticated && !!user,
    staleTime: 1000 * 60 * 10,
  });
  const isWishlisted = wishlistItems.some(
    (item) => item.targetType === WishlistTargetType.SHOW && item.targetId === showId
  );
  const toggleMutation = useMutation({
    mutationFn: () =>
      wishlistService.toggleWishlist({
        targetType: WishlistTargetType.SHOW,
        targetId: showId,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['my-wishlist', user?.id] });
      const previousWishlist = queryClient.getQueryData(['my-wishlist', user?.id]);
      queryClient.setQueryData(['my-wishlist', user?.id], (old: any[] = []) => {
        const exists = old.find(
          (item) => item.targetType === WishlistTargetType.SHOW && item.targetId === showId
        );
        if (exists) {
          return old.filter(
            (item) => !(item.targetType === WishlistTargetType.SHOW && item.targetId === showId)
          );
        } else {
          return [
            ...old,
            {
              userId: user?.id,
              targetType: WishlistTargetType.SHOW,
              targetId: showId,
              createdAt: new Date().toISOString(),
              details: { title: showTitle },
            },
          ];
        }
      });
      return { previousWishlist };
    },
    onError: (err, newTodo, context: any) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(['my-wishlist', user?.id], context.previousWishlist);
      }
      toast.error('Có lỗi xảy ra', { description: 'Vui lòng thử lại sau.' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wishlist', user?.id] });
    },
  });
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuthenticated) {
        toast.error('Vui lòng đăng nhập', {
          description: 'Bạn cần đăng nhập để thêm vào yêu thích.',
          action: {
            label: 'Đăng nhập',
            onClick: () => router.push('/login'),
          },
        });
        return;
      }
      toggleMutation.mutate();
    },
    [isAuthenticated, router, toggleMutation]
  );
  return (
    <button
      className={cn(
        'absolute right-4 top-4 z-20 rounded-full border p-2.5 shadow-lg backdrop-blur-md transition-all',
        isWishlisted
          ? 'border-red-500 bg-red-500/90 text-white hover:bg-red-600'
          : 'border-white/20 bg-white/40 text-white hover:bg-white hover:text-red-500',
        className
      )}
      aria-label={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-transform duration-200',
          isWishlisted ? 'fill-current' : '',
          isHovered && !isWishlisted ? 'scale-110' : ''
        )}
      />
    </button>
  );
}
