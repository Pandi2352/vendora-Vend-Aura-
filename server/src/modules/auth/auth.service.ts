import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException, 
  NotFoundException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { TenantStatus } from '../../shared';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Multi-Tenant Store Staff / Cashier Login
   */
  async login(dto: LoginDto) {
    const shopId = dto.shopId.toLowerCase().trim();
    const identifier = dto.username.toLowerCase().trim();

    // 1. Verify Tenant Store existence & status
    const tenant = await this.tenantModel.findOne({ shopId });
    if (!tenant) {
      throw new UnauthorizedException(`Shop "${shopId}" not found. Please verify your Shop ID.`);
    }

    if (tenant.status === TenantStatus.SUSPENDED || tenant.status === TenantStatus.EXPIRED) {
      throw new UnauthorizedException(`Shop subscription is ${tenant.status.toLowerCase()}. Please contact store administrator.`);
    }

    // 2. Find User within this Tenant Workspace (by username or email)
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

    // 3. Verify Password Hash with bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password for this shop.');
    }

    // 4. Generate Access Token (15m) and Refresh Token (7d)
    const payload = {
      sub: user._id.toString(),
      tenantId: tenant._id.toString(),
      username: user.username,
      role: user.role,
      isTemporaryPassword: user.isTemporaryPassword,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { sub: user._id.toString(), tenantId: tenant._id.toString() },
      { expiresIn: '7d' },
    );

    // 5. Store Hashed Refresh Token & Last Login
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.lastLoginAt = new Date();
    await user.save();

    return {
      accessToken,
      refreshToken,
      mustChangePassword: user.isTemporaryPassword,
      user: {
        id: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        outletIds: (user.outletIds || []).map((id) => id.toString()),
        shopId: tenant.shopId,
        businessName: tenant.businessName,
      },
    };
  }

  /**
   * Rotate and Issue New Access Token using Refresh Token
   */
  async refreshToken(dto: RefreshTokenDto) {
    try {
      const decoded: any = this.jwtService.verify(dto.refreshToken);
      const user = await this.userModel.findById(decoded.sub);

      if (!user || !user.isActive || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid or expired refresh token session.');
      }

      const isMatching = await bcrypt.compare(dto.refreshToken, user.refreshTokenHash);
      if (!isMatching) {
        throw new UnauthorizedException('Refresh token has been revoked.');
      }

      const newAccessToken = this.jwtService.sign(
        {
          sub: user._id.toString(),
          tenantId: user.tenantId.toString(),
          username: user.username,
          role: user.role,
          isTemporaryPassword: user.isTemporaryPassword,
        },
        { expiresIn: '15m' },
      );

      return {
        accessToken: newAccessToken,
      };
    } catch {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }
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

