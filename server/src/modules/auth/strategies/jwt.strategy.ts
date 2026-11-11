import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../user/schemas/user.schema';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  username: string;
  role: string;
  isTemporaryPassword?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'vendora_jwt_secret_dev_key_2026'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userModel.findById(payload.sub).lean();
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account does not exist or has been deactivated.');
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

