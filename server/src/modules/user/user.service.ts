import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schemas/subscription.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetUserPasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { ObjectIdUtil } from '../../common';
import { SUBSCRIPTION_PLANS, SubscriptionPlanCode, UserRole } from '../../shared';

function toSafeUser(userDoc: any) {
  const obj = userDoc.toObject ? userDoc.toObject() : userDoc;
  const { passwordHash, refreshTokenHash, resetTokenHash, ...safe } = obj;
  return {
    ...safe,
    id: String(obj._id),
  };
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async listUsers(tenantIdStr: string): Promise<Record<string, any>[]> {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const users = await this.userModel
      .find({ tenantId, isDeleted: { $ne: true } })
      .populate('outletIds', 'name code isPrimary')
      .sort({ createdAt: -1 })
      .lean();

    return users.map((u) => {
      const { passwordHash, refreshTokenHash, resetTokenHash, ...safe } = u;
      return { ...safe, id: String(u._id) };
    });
  }

  async createUser(tenantIdStr: string, dto: CreateUserDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const tenant = await this.tenantModel.findById(tenantId).lean();
    if (!tenant) throw new NotFoundException('Store tenant not found.');

    // Enforce subscription plan maxUsers limit
    const sub = await this.subscriptionModel.findOne({ tenantId }).lean();
    const planCode = (sub?.planCode || 'STARTER') as SubscriptionPlanCode;
    const planConfig = SUBSCRIPTION_PLANS[planCode] || SUBSCRIPTION_PLANS.STARTER;
    const maxUsers = sub?.maxUsers ?? planConfig.maxUsers;

    const currentActiveUsers = await this.userModel.countDocuments({
      tenantId,
      isDeleted: { $ne: true },
      isActive: true,
    });

    if (currentActiveUsers >= maxUsers) {
      throw new BadRequestException(
        `Staff user limit (${maxUsers}) reached for the ${planConfig.name} plan. Upgrade to add more team members.`,
      );
    }

    // Check unique username
    const username = dto.username.trim().toLowerCase();
    const existingUsername = await this.userModel.findOne({ tenantId, username });
    if (existingUsername) {
      throw new ConflictException(`Username "${username}" is already taken in this store.`);
    }

    // Check unique email
    const email = dto.email.trim().toLowerCase();
    const existingEmail = await this.userModel.findOne({ tenantId, email });
    if (existingEmail) {
      throw new ConflictException(`Email "${email}" is already registered in this store.`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const outletIds = (dto.outletIds || []).map((id) => new Types.ObjectId(id));

    const newUser = await this.userModel.create({
      tenantId,
      username,
      email,
      fullName: dto.fullName.trim(),
      phone: dto.phone?.trim(),
      role: dto.role,
      passwordHash,
      outletIds,
      isTemporaryPassword: true,
      isActive: true,
    });

    return toSafeUser(newUser);
  }

  async updateUser(tenantIdStr: string, idStr: string, dto: UpdateUserDto, currentUserId?: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'user');

    const user = await this.userModel.findOne({ _id: id, tenantId, isDeleted: { $ne: true } });
    if (!user) throw new NotFoundException('User not found.');

    // Prevent deactivating or demoting the owner account
    if (user.role === UserRole.OWNER) {
      if (dto.role && dto.role !== UserRole.OWNER) {
        throw new ForbiddenException('Cannot modify the role of the store owner.');
      }
      if (dto.isActive === false) {
        throw new ForbiddenException('Cannot deactivate the store owner account.');
      }
    }

    // Prevent modifying own active status
    if (currentUserId && String(user._id) === currentUserId && dto.isActive === false) {
      throw new BadRequestException('You cannot deactivate your own logged-in account.');
    }

    if (dto.fullName) user.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone.trim();
    if (dto.role && user.role !== UserRole.OWNER) user.role = dto.role;
    if (dto.outletIds) user.outletIds = dto.outletIds.map((o) => new Types.ObjectId(o));
    if (dto.isActive !== undefined && user.role !== UserRole.OWNER) user.isActive = dto.isActive;

    await user.save();
    return toSafeUser(user);
  }

  async resetPassword(tenantIdStr: string, idStr: string, dto: ResetUserPasswordDto) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'user');

    const user = await this.userModel.findOne({ _id: id, tenantId, isDeleted: { $ne: true } });
    if (!user) throw new NotFoundException('User not found.');

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.isTemporaryPassword = true;
    user.refreshTokenHash = undefined;
    await user.save();

    return { message: `Password for ${user.username} has been reset. User must change it upon next login.` };
  }

  async deleteUser(tenantIdStr: string, idStr: string, currentUserId?: string) {
    const tenantId = ObjectIdUtil.toObjectId(tenantIdStr, 'tenant');
    const id = ObjectIdUtil.toObjectId(idStr, 'user');

    const user = await this.userModel.findOne({ _id: id, tenantId });
    if (!user) throw new NotFoundException('User not found.');

    if (user.role === UserRole.OWNER) {
      throw new ForbiddenException('Store owner account cannot be deleted.');
    }
    if (currentUserId && String(user._id) === currentUserId) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    user.isDeleted = true;
    user.isActive = false;
    user.refreshTokenHash = undefined;
    await user.save();

    return { message: `Staff user ${user.username} has been deactivated and removed.` };
  }
}
