import type { BufferToBinary, FilterQuery, FlattenMaps, Model, PopulateOptions, Require_id, SortOrder } from 'mongoose';
import { PaginationMeta } from '../interfaces/api-response.interface';

export interface PaginateOptions {
  page: number;
  limit: number;
  sort?: Record<string, SortOrder>;
  select?: string | Record<string, 0 | 1>;
  populate?: PopulateOptions | PopulateOptions[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export class PaginationUtil {
  static createMeta(total: number, page: number, limit: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Runs a paginated lean query plus count. Return the result straight from a
   * controller: the response interceptor puts `data` and `meta` in the envelope.
   */
  static async paginate<T>(
    model: Model<T>,
    filter: FilterQuery<T>,
    options: PaginateOptions,
  ): Promise<PaginatedResult<Require_id<FlattenMaps<BufferToBinary<T>>>>> {
    const { page, limit } = options;
    let query = model
      .find(filter)
      .sort(options.sort ?? { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    if (options.select) query = query.select(options.select);
    if (options.populate) query = query.populate(options.populate as PopulateOptions);

    const [data, total] = await Promise.all([query.lean().exec(), model.countDocuments(filter).exec()]);
    return { data, meta: PaginationUtil.createMeta(total, page, limit) };
  }

  /**
   * Builds a Mongo sort from a client-chosen field, allowing only whitelisted
   * fields; falls back to `fallback`.
   */
  static resolveSort(
    sortBy: string | undefined,
    direction: 1 | -1,
    allowed: readonly string[],
    fallback: Record<string, SortOrder>,
  ): Record<string, SortOrder> {
    return sortBy && allowed.includes(sortBy) ? { [sortBy]: direction } : fallback;
  }
}
