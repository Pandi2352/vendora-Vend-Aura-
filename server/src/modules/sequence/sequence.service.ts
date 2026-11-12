import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Counter, CounterDocument } from './counter.schema';
import { DateUtil } from '../../common';

export interface NextNumberOptions {
  tenantId: Types.ObjectId | string;
  /** Document prefix, e.g. INV, RET, SHIFT, GRN */
  prefix: string;
  /** IANA timezone used to decide the year segment. */
  timezone?: string;
  /**
   * Returns the highest sequence already used for `${prefix}-${year}-` numbers.
   * Called once per tenant/prefix/year to continue numbering for data created
   * before counters existed.
   */
  findExistingMax: (numberPrefix: string) => Promise<number>;
  session?: ClientSession;
}

@Injectable()
export class SequenceService {
  constructor(@InjectModel(Counter.name) private readonly counterModel: Model<CounterDocument>) {}

  /** Returns the next document number, e.g. INV-2026-00042. Safe under concurrency. */
  async next(options: NextNumberOptions): Promise<string> {
    const year = DateUtil.yearIn(options.timezone);
    const numberPrefix = `${options.prefix}-${year}-`;
    const key = `${options.tenantId.toString()}:${options.prefix}:${year}`;

    let counter = await this.increment(key, options.session);
    if (!counter) {
      const existingMax = await options.findExistingMax(numberPrefix);
      try {
        await this.counterModel.updateOne(
          { key },
          { $setOnInsert: { key, seq: existingMax } },
          { upsert: true, session: options.session },
        );
      } catch (err) {
        if ((err as { code?: number } | null)?.code !== 11000) throw err; // another request seeded it first
      }
      counter = await this.increment(key, options.session);
    }

    return `${numberPrefix}${String(counter!.seq).padStart(5, '0')}`;
  }

  /** Parses the numeric tail of e.g. INV-2026-00042. */
  static parseSequence(documentNumber?: string | null): number {
    const match = documentNumber?.match(/-(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private increment(key: string, session?: ClientSession) {
    return this.counterModel
      .findOneAndUpdate({ key }, { $inc: { seq: 1 } }, { new: true, session })
      .lean();
  }
}
