/** Line quantity as entered (empty box = 0). */
export const lineQty = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);
