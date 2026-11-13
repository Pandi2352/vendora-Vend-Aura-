import { MsIcon } from '@/components/ui/MsIcon';

/** Leading icon for a form field's left addon (grey square before the value). */
export function FieldIcon({ name }: { name: string }) {
  return <MsIcon name={name} className="text-[1.125rem] text-zinc-500" />;
}
