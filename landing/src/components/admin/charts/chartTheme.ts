import { SubscriptionPlanCode } from '../../../shared';

/**
 * Categorical slots in validated order (see --color-chart-* in index.css).
 * Colour follows the entity: each plan always gets the same slot.
 */
export const CHART_COLORS = {
  slot1: '#2a78d6',
  slot2: '#eb6834',
  slot3: '#1baf7a',
  slot4: '#eda100',
} as const;

export const PLAN_COLORS: Record<SubscriptionPlanCode, string> = {
  [SubscriptionPlanCode.FREE_TRIAL]: CHART_COLORS.slot1,
  [SubscriptionPlanCode.STARTER]: CHART_COLORS.slot2,
  [SubscriptionPlanCode.GROWTH]: CHART_COLORS.slot3,
  [SubscriptionPlanCode.BUSINESS]: CHART_COLORS.slot4,
};

/** Recessive axes and grid. */
export const AXIS_TICK = { fill: '#71717a', fontSize: 11 } as const;
export const GRID_STROKE = '#eef0f3';
export const CHART_SURFACE = '#ffffff';

export const formatInr = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
export const formatCount = (value: number) => value.toLocaleString('en-IN');
