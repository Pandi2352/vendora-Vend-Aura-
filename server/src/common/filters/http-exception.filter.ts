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

/** Shape of a Nest HttpException body when it is an object. */
interface HttpExceptionBody {
  message?: string | string[];
  errors?: unknown;
  errorCode?: string;
}

/** Fields read from MongoDB / Mongoose errors (all optional: the exception may be anything). */
interface DriverError {
  code?: number;
  keyValue?: unknown;
  name?: string;
  path?: string;
  message?: string;
  errors?: Record<string, { message: string }>;
}

interface NormalizedError {
  statusCode: number;
  message: string | string[];
  errors?: unknown;
  errorCode: string;
}

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string) || undefined;

    const { statusCode, message, errors, errorCode } = this.normalize(exception);

    if (statusCode >= 500) {
      const err = exception as Error;
      this.logger.error(
        `[${requestId ?? '-'}] ${request.method} ${request.url} -> ${statusCode}: ${err?.message}`,
        err?.stack,
      );
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode,
      message: Array.isArray(message) ? message[0] : message,
      errors: (Array.isArray(message) && !errors ? message : errors) as ApiErrorResponse['errors'],
      errorCode,
      timestamp: DateUtil.toIso(),
      path: request.url,
      requestId,
    };

    response.status(statusCode).json(errorResponse);
  }

  private normalize(exception: unknown): NormalizedError {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse() as string | HttpExceptionBody;
      if (typeof res === 'string') {
        return { statusCode, message: res, errorCode: this.mapStatusCodeToErrorCode(statusCode) };
      }
      return {
        statusCode,
        message: res?.message || exception.message,
        errors: res?.errors,
        errorCode: res?.errorCode || this.mapStatusCodeToErrorCode(statusCode),
      };
    }

    const err = exception as DriverError | null | undefined;

    // MongoDB unique index violation
    if (err?.code === 11000) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'A record with these unique values already exists.',
        errors: err.keyValue,
        errorCode: ERROR_CODES.DUPLICATE_KEY,
      };
    }

    // Mongoose: malformed ObjectId or wrong type in a query
    if (err?.name === 'CastError') {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid value for ${err.path}.`,
        errorCode: ERROR_CODES.VALIDATION_ERROR,
      };
    }

    // Mongoose schema validation
    if (err?.name === 'ValidationError' && err.errors) {
      const messages = Object.values(err.errors).map((e) => e.message);
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: messages.length ? messages : 'Validation failed.',
        errorCode: ERROR_CODES.VALIDATION_ERROR,
      };
    }

    // Anything else is a server bug: never leak internals in production.
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: this.isProduction ? 'Internal server error occurred' : err?.message || 'Internal server error occurred',
      errorCode: ERROR_CODES.INTERNAL_ERROR,
    };
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
      case HttpStatus.TOO_MANY_REQUESTS:
        return ERROR_CODES.RATE_LIMITED;
      default:
        return status >= 500 ? ERROR_CODES.INTERNAL_ERROR : ERROR_CODES.BAD_REQUEST;
    }
  }
}
