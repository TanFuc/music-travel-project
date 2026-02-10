'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationClientProps {
  currentPage: number;
  totalPages: number;
}

export function PaginationClient({ currentPage, totalPages }: PaginationClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  if (totalPages <= 1) return null;

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if at beginning or end
    if (currentPage <= 2) {
      end = Math.min(4, totalPages - 1);
    } else if (currentPage >= totalPages - 1) {
      start = Math.max(2, totalPages - 3);
    }

    // Add ellipsis if needed
    if (start > 2) {
      pages.push('ellipsis');
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="mt-16 flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="icon"
        className={cn(
          'w-12 h-12 rounded-2xl border-gray-100 text-gray-400 hover:text-brand-600 hover:border-brand-500 transition-all',
          isPending && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-2">
        {visiblePages.map((page, idx) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => goToPage(page)}
              disabled={isPending}
              className={cn(
                'w-10 h-10 rounded-xl text-sm font-bold transition-all',
                currentPage === page
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'bg-white text-gray-400 border border-gray-100 hover:border-brand-500/30 hover:text-brand-600',
                isPending && 'opacity-50 cursor-not-allowed'
              )}
            >
              {page}
            </button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        className={cn(
          'w-12 h-12 rounded-2xl border-gray-100 text-gray-400 hover:text-brand-600 hover:border-brand-500 transition-all',
          isPending && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
