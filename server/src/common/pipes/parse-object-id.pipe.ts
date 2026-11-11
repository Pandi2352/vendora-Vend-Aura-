import { Injectable, PipeTransform } from '@nestjs/common';
import { ObjectIdUtil } from '../utils/object-id.util';

/** Validates a route param as a MongoDB ObjectId: `@Param('id', ParseObjectIdPipe) id: string`. */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    ObjectIdUtil.toObjectId(value, 'resource');
    return value;
  }
}
