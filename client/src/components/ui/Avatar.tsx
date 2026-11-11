import { cn } from './cn';
import { initialOf } from '@/utils/string';

const SIZES = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' } as const;

interface AvatarProps {
  name?: string;
  src?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Profile picture, or the first letter of the name when there is no image. */
export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const base = cn('inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden', SIZES[size], className);
  if (src) return <img src={src} alt={name ?? ''} className={cn(base, 'object-cover')} />;
  return (
    <span className={cn(base, 'bg-primary-600 text-white font-bold')} aria-label={name}>
      {initialOf(name)}
    </span>
  );
}
