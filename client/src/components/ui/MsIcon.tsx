import { cn } from './cn';

export interface MsIconProps {
  name: string;
  className?: string;
}

/** Material Symbols Outlined icon renderer with retail UI defaults. */
export function MsIcon({ name, className }: MsIconProps) {
  return (
    <span className={cn('ms', className)} aria-hidden="true">
      {name}
    </span>
  );
}
