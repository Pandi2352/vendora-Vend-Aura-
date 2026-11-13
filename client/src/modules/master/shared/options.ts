/** Option lists ({ value, label }) used by Master dropdowns, schemas and tables. */
export type OptionList = readonly { value: string; label: string }[];

/** Label for a stored value, falling back to the value itself. */
export const labelOf = (list: OptionList, value: string) => list.find((o) => o.value === value)?.label ?? value;

/** The values of an option list as a tuple, for z.enum(). */
export const enumOf = <T extends readonly { value: string }[]>(list: T) =>
  list.map((o) => o.value) as unknown as [T[number]['value'], ...T[number]['value'][]];
