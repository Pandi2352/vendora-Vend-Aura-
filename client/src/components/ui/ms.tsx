import { MsIcon } from './MsIcon';

/** Creates a reusable Material Symbol component matching React ComponentType<{ className?: string }>. */
export function ms(name: string) {
  const IconComponent = ({ className }: { className?: string }) => <MsIcon name={name} className={className} />;
  IconComponent.displayName = `MsIcon(${name})`;
  return IconComponent;
}
