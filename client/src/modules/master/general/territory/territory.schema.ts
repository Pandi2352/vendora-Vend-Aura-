import { z } from 'zod';
import { rules, withCrossFieldRules } from '@/validations/common';
import { masterRules, uniqueCodeRule } from '../../shared/rules';
import type { MasterRecord } from '../../shared/data/types';

/** Browser-storage key until the server has a territories endpoint. */
export const TERRITORY_RESOURCE = 'territories';

const territoryShape = z.object({
  code: masterRules.code('Territory code'),
  name: masterRules.name('Territory name'),
  /** Group this territory sits under; empty = top level. */
  parentId: rules.optionalSelect(),
  /** Groups can hold other territories (branch node). */
  isGroup: z.boolean(),
  active: masterRules.active(),
});

export type TerritoryValues = z.output<typeof territoryShape>;
export type TerritoryInput = z.input<typeof territoryShape>;
export type Territory = TerritoryValues & MasterRecord;

/** Ids of a territory and everything below it (a territory cannot move under itself). */
export function subtreeIds(rows: Territory[], rootId: string): Set<string> {
  const ids = new Set([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const r of rows) {
      if (r.parentId && ids.has(r.parentId) && !ids.has(r.id)) {
        ids.add(r.id);
        grew = true;
      }
    }
  }
  return ids;
}

export const territorySchema = (rows: Territory[], editingId?: string) =>
  withCrossFieldRules(territoryShape, [
    uniqueCodeRule<TerritoryValues>(rows, editingId, 'Territory code'),
    {
      fields: ['isGroup'],
      check: (v, ctx) => {
        // A group that still has territories under it cannot become a plain territory.
        if (editingId && !v.isGroup && rows.some((r) => r.parentId === editingId)) {
          ctx.addIssue({
            code: 'custom',
            path: ['isGroup'],
            message: 'Move or delete the territories under this group first',
          });
        }
      },
    },
  ]);

export const TERRITORY_DEFAULTS: TerritoryInput = { code: '', name: '', parentId: null, isGroup: false, active: true };

export interface TerritoryRow extends Territory {
  depth: number;
}

/** Rows in tree order (each group followed by its children) with their depth. */
export function territoryTree(rows: Territory[]): TerritoryRow[] {
  const byParent = new Map<string | null, Territory[]>();
  const ids = new Set(rows.map((r) => r.id));
  for (const r of rows) {
    const parent = r.parentId && ids.has(r.parentId) ? r.parentId : null;
    byParent.set(parent, [...(byParent.get(parent) ?? []), r]);
  }
  const out: TerritoryRow[] = [];
  const walk = (parent: string | null, depth: number) => {
    for (const r of (byParent.get(parent) ?? []).sort((a, b) => a.code.localeCompare(b.code))) {
      out.push({ ...r, depth });
      walk(r.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}
