/**
 * Adds the `id` (string) and `itemsCount` fields the frontends expect to a
 * lean Mongo document that only carries `_id` and an optional `items` array.
 */
export function toDocumentView<T extends { _id: unknown; items?: unknown[] }>(
  doc: T,
): T & { id: string; itemsCount: number } {
  return { ...doc, id: String(doc._id), itemsCount: doc.items?.length ?? 0 };
}
