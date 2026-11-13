/** Every Master record has an id and an on/off status. */
export interface MasterRecord {
  id: string;
  active: boolean;
}

export type MasterValues<T extends MasterRecord> = Omit<T, 'id'>;

/**
 * Where a Master list is stored. Screens only talk to this interface, so moving
 * a list from browser storage to a server API means swapping its adapter.
 */
export interface MasterAdapter<T extends MasterRecord> {
  list: () => Promise<T[]>;
  create: (values: MasterValues<T>) => Promise<T>;
  update: (id: string, values: MasterValues<T>) => Promise<T>;
  /** Omit when records cannot be deleted (e.g. outlets). */
  remove?: (id: string) => Promise<void>;
}
