import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: 32,
  md: 48,
  lg: 64,
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <Image
        src="/logo.jpg"
        alt="Logo"
        width={sizes[size]}
        height={sizes[size]}
        className="rounded-full object-cover"
        priority
      />
      {showText && (
        <span className="font-display text-lg font-bold text-brand-600">Music & Travel</span>
      )}
    </Link>
  );
}
