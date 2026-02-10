import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center gap-2 sm:gap-3 group flex-shrink-0', className)}>
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-white flex-shrink-0',
          'shadow-md border-2 border-brand-500/30',
          'transition-all duration-300',
          'group-hover:border-brand-500/50 group-hover:shadow-lg group-hover:scale-105',
          sizeClasses[size]
        )}
      >
        <Image
          src="/logo.png"
          alt="Mãi Cho Hành Tinh Xanh"
          fill
          sizes="(max-width: 768px) 40px, (max-width: 1024px) 64px, 96px"
          className="object-cover"
          priority
        />
      </div>
      {showText && (
        <span className="font-display text-base sm:text-lg font-bold text-brand-600 whitespace-nowrap">
          Music & Travel
        </span>
      )}
    </Link>
  );
}
