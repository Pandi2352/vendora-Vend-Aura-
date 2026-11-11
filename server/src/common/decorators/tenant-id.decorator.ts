import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ObjectIdUtil } from '../utils/object-id.util';
import { ERROR_CODES } from '../constants/error-codes.constant';

/**
 * Resolves the tenant from the authenticated user's token. Request-supplied
 * tenant IDs are never trusted.
 */
export const TenantId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const tenantId: string | undefined = ctx.switchToHttp().getRequest().user?.tenantId;
  if (!ObjectIdUtil.isValid(tenantId)) {
    throw new ForbiddenException({
      message: 'This action requires a store user session.',
      errorCode: ERROR_CODES.TENANT_CONTEXT_REQUIRED,
    });
  }
  return tenantId;
});
