import { Badge } from '@/components/ui/Badge';

/** Active / Inactive pill for Master tables (dot + text, not colour alone). */
export function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? 'success' : 'neutral'} dot>
      {active ? 'Active' : 'Inactive'}
    </Badge>
  );
}
