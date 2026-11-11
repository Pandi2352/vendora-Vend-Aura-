import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';
import { ERROR_CODES } from '../constants/error-codes.constant';
import { DateUtil } from '../utils/date.util';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error occurred';
    let errors: any = undefined;
    let errorCode: string = ERROR_CODES.INTERNAL_ERROR;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res: any = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = res.message || exception.message;
        errors = res.errors || (Array.isArray(res.message) ? res.message : undefined);
        errorCode = res.errorCode || this.mapStatusCodeToErrorCode(statusCode);
      }
    } else if (this.isMongoDuplicateError(exception)) {
      statusCode = HttpStatus.CONFLICT;
      message = 'Duplicate entry detected. A resource with these unique values already exists.';
      errorCode = ERROR_CODES.DUPLICATE_KEY;
      errors = (exception as any).keyValue;
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode,
      message: Array.isArray(message) ? message[0] : message,
      errors: Array.isArray(message) && !errors ? message : errors,
      errorCode,
      timestamp: DateUtil.toIso(),
      path: request.url,
      requestId: (request.headers['x-request-id'] as string) || undefined,
    };

    response.status(statusCode).json(errorResponse);
  }

  private isMongoDuplicateError(err: any): boolean {
    return err && (err.code === 11000 || err.name === 'MongoServerError');
  }

  private mapStatusCodeToErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODES.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODES.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ERROR_CODES.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ERROR_CODES.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ERROR_CODES.DUPLICATE_KEY;
      default:
        return ERROR_CODES.INTERNAL_ERROR;
    }
  }
}

