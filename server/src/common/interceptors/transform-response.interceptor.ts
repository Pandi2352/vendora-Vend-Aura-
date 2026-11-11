import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';
import { DEFAULT_MESSAGES } from '../constants/error-codes.constant';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const path = req.url || '';
    const requestId = req.headers['x-request-id'] || undefined;

    return next.handle().pipe(
      map((resData) => {
        // If already formatted as ApiResponse or is a buffer/stream/receipt, return as is
        if (resData && typeof resData === 'object' && 'success' in resData && 'timestamp' in resData) {
          return resData;
        }

        let message = DEFAULT_MESSAGES.SUCCESS;
        let data = resData;
        let meta = null;

        // If returned object has custom message or data wrapper
        if (resData && typeof resData === 'object' && !Array.isArray(resData)) {
          if ('message' in resData && typeof resData.message === 'string') {
            message = resData.message;
          }
          if ('meta' in resData) {
            meta = resData.meta;
          }
          if ('data' in resData) {
            data = resData.data;
          }
        }

        return {
          success: true,
          message,
          data,
          meta,
          timestamp: new Date().toISOString(),
          path,
          requestId,
        };
      }),
    );
  }
}

