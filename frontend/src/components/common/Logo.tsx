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
    <Link
      href="/"
      className={cn('group flex flex-shrink-0 items-center gap-2 sm:gap-3', className)}
    >
      <div
        className={cn(
          'relative flex-shrink-0 overflow-hidden rounded-full bg-white',
          'border-2 border-brand-500/30 shadow-md',
          'transition-all duration-300',
          'group-hover:scale-105 group-hover:border-brand-500/50 group-hover:shadow-lg',
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
        <span className="whitespace-nowrap font-display text-base font-bold text-brand-600 sm:text-lg">
          Music & Travel
        </span>
      )}
    </Link>
  );
}
