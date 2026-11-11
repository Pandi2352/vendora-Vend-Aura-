import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtpEmail(to: string, otp: string): Promise<boolean> {
    this.logger.log(`\n================================================================`);
    this.logger.log(`📧 [VENDORA TRANSACTIONAL EMAIL: EMAIL OTP]`);
    this.logger.log(`Recipient: ${to}`);
    this.logger.log(`Subject: Verify your email – Vendora Cloud Retail POS`);
    this.logger.log(`\nHello,`);
    this.logger.log(`Your Vendora email verification code is:`);
    this.logger.log(`\n            ┌──────────┐`);
    this.logger.log(`            │  ${otp}  │`);
    this.logger.log(`            └──────────┘`);
    this.logger.log(`\nThis OTP is valid for 5 minutes.`);
    this.logger.log(`================================================================\n`);
    return true;
  }

  async sendWelcomeCredentialsEmail(payload: {
    to: string;
    ownerName: string;
    businessName: string;
    shopId: string;
    username: string;
    temporaryPassword: string;
    shopUrl: string;
  }): Promise<boolean> {
    this.logger.log(`\n================================================================`);
    this.logger.log(`🚀 [VENDORA TRANSACTIONAL EMAIL: WELCOME & LOGIN CREDENTIALS]`);
    this.logger.log(`Recipient: ${payload.to}`);
    this.logger.log(`Subject: Your Vendora Cloud POS account is ready! 🚀`);
    this.logger.log(`\nHello ${payload.ownerName},`);
    this.logger.log(`Welcome to Vendora! Your store account has been successfully created.`);
    this.logger.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.logger.log(`🏪 Business Name:  ${payload.businessName}`);
    this.logger.log(`🔗 Shop Login URL: ${payload.shopUrl}`);
    this.logger.log(`👤 Username:       ${payload.username}`);
    this.logger.log(`🔑 Temporary Pass: ${payload.temporaryPassword}`);
    this.logger.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    this.logger.log(`\nSecurity Reminder:`);
    this.logger.log(`Please change your temporary password immediately upon your first login.`);
    this.logger.log(`================================================================\n`);
    return true;
  }
}

