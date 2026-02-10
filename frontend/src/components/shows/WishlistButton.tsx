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

  // Fetch all wishlist items for the user (shared query)
  const { data: wishlistItems = [] } = useQuery({
    queryKey: ['my-wishlist', user?.id],
    queryFn: () => wishlistService.getMyWishlist(),
    enabled: isAuthenticated && !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });

  const isWishlisted = wishlistItems.some(item => 
    item.targetType === WishlistTargetType.SHOW && item.targetId === showId
  );

  const toggleMutation = useMutation({
    mutationFn: () => wishlistService.toggleWishlist({
      targetType: WishlistTargetType.SHOW,
      targetId: showId,
    }),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['my-wishlist', user?.id] });
      
      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['my-wishlist', user?.id]);

      // Optimistically update
      queryClient.setQueryData(['my-wishlist', user?.id], (old: any[] = []) => {
        const exists = old.find(item => item.targetType === WishlistTargetType.SHOW && item.targetId === showId);
        
        if (exists) {
          // Remove
          return old.filter(item => !(item.targetType === WishlistTargetType.SHOW && item.targetId === showId));
        } else {
          // Add (optimistic item)
          return [...old, { 
            userId: user?.id, 
            targetType: WishlistTargetType.SHOW, 
            targetId: showId, 
            createdAt: new Date().toISOString(),
            details: { title: showTitle } // minimal details for optimistic UI
          }];
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
    onSuccess: (data) => {
      const isAdded = data.isWishlisted;
      // No toast needed for simple toggle, or maybe a small one
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync
      queryClient.invalidateQueries({ queryKey: ['my-wishlist', user?.id] });
    },
  });

  const handleClick = useCallback((e: React.MouseEvent) => {
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
  }, [isAuthenticated, router, toggleMutation]);

  return (
    <button
      className={cn(
        "absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all border z-20",
        isWishlisted 
          ? "bg-red-500/90 text-white border-red-500 hover:bg-red-600" 
          : "bg-white/40 text-white border-white/20 hover:bg-white hover:text-red-500",
        className
      )}
      aria-label={isWishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Heart 
        className={cn(
          "w-5 h-5 transition-transform duration-200", 
          isWishlisted ? "fill-current" : "",
          isHovered && !isWishlisted ? "scale-110" : ""
        )} 
      />
    </button>
  );
}
