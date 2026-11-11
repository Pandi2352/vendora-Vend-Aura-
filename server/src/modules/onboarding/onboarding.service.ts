import { 
  Injectable, 
  BadRequestException, 
  NotFoundException, 
  ConflictException,
  Logger 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Tenant, TenantDocument } from '../tenant/schemas/tenant.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Outlet, OutletDocument } from '../outlet/schemas/outlet.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schemas/subscription.schema';
import { RegistrationSession, RegistrationSessionDocument } from './schemas/registration-session.schema';
import { MailService } from '../mail/mail.service';
import { CatalogService } from '../catalog/catalog.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { 
  SUBSCRIPTION_PLANS, 
  SubscriptionPlanCode, 
  RegistrationStatus, 
  TenantStatus, 
  UserRole 
} from '../../shared';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<OutletDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(RegistrationSession.name) private readonly sessionModel: Model<RegistrationSessionDocument>,
    private readonly mailService: MailService,
    private readonly catalogService: CatalogService,
  ) {}

  // 1. Get SaaS Pricing Plans
  getPlans() {
    return Object.values(SUBSCRIPTION_PLANS);
  }

  // 2. Request Email Verification OTP
  async requestOtp(dto: RequestOtpDto) {
    const email = dto.email.toLowerCase().trim();
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins TTL
    const sessionId = 'reg_' + crypto.randomBytes(8).toString('hex');

    await this.sessionModel.create({
      sessionId,
      email,
      selectedPlanCode: dto.selectedPlanCode,
      otpHash,
      otpExpiresAt,
      otpAttempts: 0,
      status: RegistrationStatus.EMAIL_PENDING,
    });

    // Send email via mail service
    await this.mailService.sendOtpEmail(email, otp);

    return {
      sessionId,
      email,
      expiresInSeconds: 300,
      message: 'Verification OTP has been dispatched to your email.',
    };
  }

  // 3. Verify Email OTP
  async verifyOtp(dto: VerifyOtpDto) {
    const session = await this.sessionModel.findOne({ sessionId: dto.sessionId });
    if (!session) {
      throw new NotFoundException('Registration session expired or invalid.');
    }

    if (session.otpExpiresAt && session.otpExpiresAt < new Date()) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    if (session.otpAttempts >= 5) {
      throw new BadRequestException('Too many incorrect attempts. Please request a new OTP.');
    }

    const isMatch = await bcrypt.compare(dto.otp, session.otpHash || '');
    if (!isMatch) {
      await this.sessionModel.updateOne({ _id: session._id }, { $inc: { otpAttempts: 1 } });
      throw new BadRequestException('Incorrect 6-digit OTP code. Please check and try again.');
    }

    await this.sessionModel.updateOne(
      { _id: session._id },
      { $set: { status: RegistrationStatus.EMAIL_VERIFIED } },
    );

    return {
      sessionId: session.sessionId,
      isVerified: true,
      email: session.email,
      message: 'Email successfully verified. You can now register your store details.',
    };
  }

  // 4. Check Subdomain / Shop ID Availability
  async checkSubdomain(shopId: string) {
    const slug = (shopId || '').toLowerCase().trim();
    if (!slug) {
      return {
        shopId: '',
        isAvailable: false,
        reason: 'Customer ID is required.',
      };
    }

    if (slug.length < 3 || slug.length > 6) {
      return {
        shopId: slug,
        isAvailable: false,
        reason: 'Customer ID must be between 3 and 6 letters or numbers.',
      };
    }

    if (!/^[a-z0-9]+$/.test(slug)) {
      return {
        shopId: slug,
        isAvailable: false,
        reason: 'Only alphanumeric characters (letters and numbers) are allowed.',
      };
    }

    const reserved = ['admin', 'api', 'app', 'www', 'mail', 'billing', 'pos', 'vendora', 'root', 'support'];
    
    if (reserved.includes(slug)) {
      return {
        shopId: slug,
        isAvailable: false,
        reason: `Customer ID "${slug}" is a reserved system identifier. Please choose another.`,
      };
    }

    const existing = await this.tenantModel.findOne({ shopId: slug });
    if (existing) {
      return {
        shopId: slug,
        isAvailable: false,
        reason: `Customer ID "${slug}" is already taken. Please choose another.`,
      };
    }

    return {
      shopId: slug,
      isAvailable: true,
      message: `"${slug}" is available!`,
      fullSubdomainUrl: `https://${slug}.vendora.com`,
    };
  }

  // 5. Complete Registration & Auto-Provision Tenant Workspace
  async completeRegistration(dto: CompleteRegistrationDto) {
    const session = await this.sessionModel.findOne({ sessionId: dto.sessionId });
    if (!session) {
      throw new NotFoundException('Registration session not found.');
    }

    if (session.status !== RegistrationStatus.EMAIL_VERIFIED) {
      throw new BadRequestException('Email address must be verified via OTP before registration.');
    }

    const shopId = dto.preferredShopId.toLowerCase().trim();

    // Check uniqueness
    const existing = await this.tenantModel.findOne({ shopId });
    if (existing) {
      throw new ConflictException(`Shop ID "${shopId}" is already taken. Please pick another identifier.`);
    }

    // Provision Tenant Document
    const tenant = await this.tenantModel.create({
      shopId,
      businessName: dto.businessName.trim(),
      ownerName: dto.ownerName.trim(),
      email: session.email,
      phone: dto.phone.trim(),
      businessType: dto.businessType,
      status: TenantStatus.TRIAL,
      settings: {
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        taxType: 'GST',
        address: dto.address,
        gstin: dto.gstin,
      },
    });

    // Provision Default Primary Outlet (Main Branch)
    const outlet = await this.outletModel.create({
      tenantId: tenant._id,
      name: 'Main Branch',
      code: 'OUT-01',
      isPrimary: true,
      phone: dto.phone.trim(),
      email: session.email,
      address: dto.address,
      isActive: true,
    });

    // Generate Secure Temporary Password (e.g. "Vx7#kM9q")
    const tempPassword = 'Vn' + crypto.randomBytes(3).toString('hex') + '!';
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const username = `${shopId}_admin`;

    // Provision Super Admin (Owner) User
    const user = await this.userModel.create({
      tenantId: tenant._id,
      outletIds: [outlet._id],
      username,
      email: session.email,
      fullName: dto.ownerName.trim(),
      passwordHash,
      role: UserRole.OWNER,
      isTemporaryPassword: true,
      isActive: true,
    });

    // Provision 30-Day Free Trial Subscription
    const planDetails = SUBSCRIPTION_PLANS[session.selectedPlanCode] || SUBSCRIPTION_PLANS[SubscriptionPlanCode.FREE_TRIAL];
    const subscription = await this.subscriptionModel.create({
      tenantId: tenant._id,
      planCode: session.selectedPlanCode,
      status: 'TRIAL',
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + (planDetails.durationDays || 30) * 24 * 60 * 60 * 1000),
      maxOutlets: planDetails.maxOutlets,
      maxUsers: planDetails.maxUsers,
      maxBillsPerMonth: planDetails.maxBillsPerMonth,
      billsGeneratedThisMonth: 0,
      isTrial: true,
    });

    // Link references to Tenant
    await this.tenantModel.updateOne(
      { _id: tenant._id },
      {
        $set: {
          primaryOutletId: outlet._id,
          subscriptionId: subscription._id,
        },
      },
    );

    // Seed initial starter catalog tailored to business sector
    try {
      await this.catalogService.seedTenantCatalog(tenant._id, tenant.businessType);
    } catch (err: any) {
      this.logger.warn(`Could not seed catalog for tenant ${shopId}: ${err.message}`);
    }

    // Send Welcome Credentials Email
    const loginUrl = `http://localhost:4001/login?shopId=${shopId}`;
    await this.mailService.sendWelcomeCredentialsEmail({
      to: session.email,
      ownerName: dto.ownerName,
      businessName: dto.businessName,
      shopId,
      username,
      temporaryPassword: tempPassword,
      shopUrl: loginUrl,
    });

    // Update Session status to ACTIVE
    await this.sessionModel.updateOne(
      { _id: session._id },
      { $set: { status: RegistrationStatus.ACTIVE } },
    );

    this.logger.log(`✓ Tenant [${shopId}] successfully provisioned with Owner [${username}].`);

    return {
      tenantId: tenant._id,
      shopId: tenant.shopId,
      loginUrl,
      username,
      temporaryPassword: tempPassword,
      trialEndsAt: subscription.expiresAt,
    };
  }
}
