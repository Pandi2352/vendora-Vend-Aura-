import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

/** Single place for validating and converting MongoDB ObjectIds. */
export class ObjectIdUtil {
  static isValid(id: unknown): id is string | Types.ObjectId {
    return (typeof id === 'string' || id instanceof Types.ObjectId) && Types.ObjectId.isValid(id);
  }

  /** Converts or throws 400 `Invalid <label> ID`. */
  static toObjectId(id: string | Types.ObjectId, label = 'resource'): Types.ObjectId {
    if (id instanceof Types.ObjectId) return id;
    if (!ObjectIdUtil.isValid(id)) {
      throw new BadRequestException(`Invalid ${label} ID`);
    }
    return new Types.ObjectId(id);
  }

  /** Converts when valid, otherwise returns null (for optional filters). */
  static toObjectIdOrNull(id?: string | null): Types.ObjectId | null {
    return id && ObjectIdUtil.isValid(id) ? new Types.ObjectId(id) : null;
  }
}
