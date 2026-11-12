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

/** Creates a reusable Material Symbol component matching React ComponentType<{ className?: string }>. */
export function ms(name: string) {
  const IconComponent = ({ className }: { className?: string }) => (
    <MsIcon name={name} className={className} />
  );
  IconComponent.displayName = `MsIcon(${name})`;
  return IconComponent;
}

