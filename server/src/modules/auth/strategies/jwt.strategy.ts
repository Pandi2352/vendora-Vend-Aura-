import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { Tenant, TenantDocument } from '../../tenant/schemas/tenant.schema';
import { AuthenticatedUser, ObjectIdUtil } from '../../../common';
import { TenantStatus, UserRole } from '../../../shared';

export const PLATFORM_ADMIN_SUBJECT = 'platform-super-admin';
export const PLATFORM_ADMIN_TOKEN_ROLE = 'PLATFORM_SUPER_ADMIN';

export interface JwtPayload {
  sub: string;
  tenantId?: string;
  username: string;
  role: string;
  isTemporaryPassword?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (payload.sub === PLATFORM_ADMIN_SUBJECT && payload.role === PLATFORM_ADMIN_TOKEN_ROLE) {
      return {
        userId: PLATFORM_ADMIN_SUBJECT,
        username: payload.username,
        email: '',
        role: UserRole.SUPER_ADMIN,
        isPlatformAdmin: true,
      };
    }

    if (!ObjectIdUtil.isValid(payload.sub)) {
      throw new UnauthorizedException('Invalid session token.');
    }

    const user = await this.userModel.findById(payload.sub).lean();
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account does not exist or has been deactivated.');
    }

    const tenant = await this.tenantModel.findById(user.tenantId).select('status').lean();
    if (!tenant || tenant.status === TenantStatus.SUSPENDED || tenant.status === TenantStatus.EXPIRED) {
      throw new UnauthorizedException('This shop is suspended or its subscription has expired.');
    }

    return {
      userId: user._id.toString(),
      tenantId: user.tenantId.toString(),
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      outletIds: (user.outletIds || []).map((id) => id.toString()),
      isTemporaryPassword: user.isTemporaryPassword,
    };
  }
}
