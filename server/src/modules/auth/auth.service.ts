import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException, 
  NotFoundException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { TenantStatus } from '../../shared';
import { CryptoUtil, DateUtil, ObjectIdUtil } from '../../common';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Multi-Tenant Store Staff / Cashier Login
   */
  async login(dto: LoginDto) {
    const shopId = dto.shopId.toLowerCase().trim();
    const identifier = dto.username.toLowerCase().trim();

    const tenant = await this.tenantModel.findOne({ shopId });
    if (!tenant) {
      throw new UnauthorizedException(`Shop "${shopId}" not found. Please verify your Shop ID.`);
    }
    this.assertTenantActive(tenant);

    const user = await this.userModel.findOne({
      tenantId: tenant._id,
      $or: [{ username: identifier }, { email: identifier }],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid username or password for this shop.');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated. Please contact your store manager.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password for this shop.');
    }

    user.lastLoginAt = DateUtil.nowUtc();
    const tokens = await this.issueTokens(user);
    const outlet = await this.resolveOutlet(tenant, user);
    const outletAddress = outlet?.address?.city ? outlet.address : undefined;

    return {
      ...tokens,
      mustChangePassword: user.isTemporaryPassword,
      user: {
        id: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        outletIds: (user.outletIds || []).map((id) => id.toString()),
        tenantId: tenant._id.toString(),
        shopId: tenant.shopId,
        businessName: tenant.businessName,
        store: {
          address: this.formatAddress(outletAddress || tenant.settings?.address),
          gstin: tenant.settings?.gstin || null,
          phone: outlet?.phone || tenant.phone,
          outletCode: outlet?.code || 'OUT-01',
        },
      },
    };
  }

  /**
   * Rotates the refresh token and issues a new access token. Refresh tokens are
   * signed with JWT_REFRESH_SECRET, so they can never pass as access tokens.
   */
  async refreshToken(dto: RefreshTokenDto) {
    let decoded: { sub?: string };
    try {
      decoded = this.jwtService.verify(dto.refreshToken, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    const userId = ObjectIdUtil.toObjectIdOrNull(decoded.sub);
    const user = userId ? await this.userModel.findById(userId) : null;
    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid or expired refresh token session.');
    }

    if (!this.matchesRefreshHash(dto.refreshToken, user.refreshTokenHash)) {
      throw new UnauthorizedException('Refresh token has been revoked.');
    }

    const tenant = await this.tenantModel.findById(user.tenantId);
    if (!tenant) {
      throw new UnauthorizedException('Shop no longer exists.');
    }
    this.assertTenantActive(tenant);

    return this.issueTokens(user);
  }

  private get refreshSecret(): string {
    return this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  private assertTenantActive(tenant: TenantDocument) {
    if (tenant.status === TenantStatus.SUSPENDED || tenant.status === TenantStatus.EXPIRED) {
      throw new UnauthorizedException(
        `Shop subscription is ${tenant.status.toLowerCase()}. Please contact store administrator.`,
      );
    }
  }

  /** Issues an access + refresh pair and stores the refresh hash (rotation). Saves the user. */
  private async issueTokens(user: UserDocument) {
    const accessToken = this.jwtService.sign(
      {
        sub: user._id.toString(),
        tenantId: user.tenantId.toString(),
        username: user.username,
        role: user.role,
      },
      { expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m') as any },
    );
    const refreshToken = this.jwtService.sign(
      { sub: user._id.toString(), jti: randomUUID() },
      {
        secret: this.refreshSecret,
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      },
    );

    user.refreshTokenHash = this.hashRefreshToken(refreshToken);
    await user.save();
    return { accessToken, refreshToken };
  }

  /**
   * SHA-256, not bcrypt: bcrypt only reads the first 72 bytes and every JWT
   * shares its first 72 bytes, so bcrypt would accept any old refresh token.
   */
  private hashRefreshToken(token: string): string {
    return CryptoUtil.hash(token);
  }

  private matchesRefreshHash(token: string, storedHash: string): boolean {
    return CryptoUtil.constantTimeCompare(this.hashRefreshToken(token), storedHash);
  }

  /** Revokes the refresh token so the session cannot be renewed. */
  async logout(userId: string) {
    await this.userModel.updateOne({ _id: ObjectIdUtil.toObjectId(userId, 'user') }, { $unset: { refreshTokenHash: 1 } });
    return { message: 'Logged out' };
  }

  private async resolveOutlet(tenant: TenantDocument, user: UserDocument) {
    const outletId = user.outletIds?.[0] || tenant.primaryOutletId;
    if (outletId) {
      const outlet = await this.outletModel.findOne({ _id: outletId, tenantId: tenant._id }).lean();
      if (outlet) return outlet;
    }
    return this.outletModel.findOne({ tenantId: tenant._id, isPrimary: true }).lean();
  }

  private formatAddress(address?: { street?: string; city?: string; state?: string; pincode?: string }) {
    if (!address) return '';
    const cityLine = [address.city, address.pincode].filter(Boolean).join(' - ');
    return [address.street, cityLine, address.state].filter(Boolean).join(', ');
  }

  /**
   * First-Login Password Change or Regular Password Update
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new BadRequestException('Current password does not match.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from the current password.');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.isTemporaryPassword = false;
    user.refreshTokenHash = undefined; // Invalidate previous refresh tokens
    await user.save();

    return {
      message: 'Password updated successfully. You can now use your new password.',
    };
  }

  /**
   * Get Current Authenticated User Profile & Shop Context
   */
  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    const tenant = await this.tenantModel.findById(user.tenantId).lean();

    return {
      id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      outletIds: (user.outletIds || []).map((id) => id.toString()),
      isTemporaryPassword: user.isTemporaryPassword,
      shop: tenant ? {
        id: tenant._id.toString(),
        shopId: tenant.shopId,
        businessName: tenant.businessName,
        status: tenant.status,
        businessType: tenant.businessType,
      } : null,
    };
  }
}

