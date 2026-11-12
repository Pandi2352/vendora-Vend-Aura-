import { Injectable, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import {
  IS_PUBLIC_KEY,
  ALLOW_TEMPORARY_PASSWORD_KEY,
  ERROR_CODES,
  AuthenticatedUser,
} from '../../../common';

/**
 * Registered globally (APP_GUARD). Every route requires a valid access token
 * unless marked @Public(). Users on a temporary password may only reach routes
 * marked @AllowTemporaryPassword().
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }

    await super.canActivate(context);

    const user = context.switchToHttp().getRequest().user as AuthenticatedUser;
    const allowTemporary = this.reflector.getAllAndOverride<boolean>(ALLOW_TEMPORARY_PASSWORD_KEY, targets);
    if (user?.isTemporaryPassword && !allowTemporary) {
      throw new ForbiddenException({
        message: 'Please change your temporary password before continuing.',
        errorCode: ERROR_CODES.PASSWORD_CHANGE_REQUIRED,
      });
    }
    return true;
  }

  handleRequest<TUser = AuthenticatedUser>(err: unknown, user: TUser | false | null): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication token required or session expired.');
    }
    return user;
  }
}
