'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-opacity duration-200',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onTransitionEnd={() => !isOpen && setIsAnimating(false)}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Container */}
      <div
        className={cn(
          'relative w-full transition-transform duration-200',
          isOpen ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <div className="bg-white shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <SearchBar
              showFilters={true}
              onClose={onClose}
              isExpanded={isOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
