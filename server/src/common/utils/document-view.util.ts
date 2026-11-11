/** Adds a string `id` (from `_id`) to a lean Mongo document for API responses. */
export function withId<T extends { _id: unknown }>(doc: T): T & { id: string } {
  return { ...doc, id: String(doc._id) };
}

/** `withId` plus `itemsCount` for documents with an `items` array (orders, returns, GRNs). */
export function toDocumentView<T extends { _id: unknown; items?: unknown[] }>(
  doc: T,
): T & { id: string; itemsCount: number } {
  return { ...withId(doc), itemsCount: doc.items?.length ?? 0 };
}
