import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { OTP_TTL_MINUTES, PASSWORD_RESET_TTL_MINUTES, StringUtil } from '../../common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = Number(this.configService.get<number>('SMTP_PORT', 587));
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass,
          },
        });
        this.logger.log(`MailService using SMTP ${host}:${port}`);
      } catch (err) {
        this.logger.error(`❌ Failed to initialize SMTP transporter: ${(err as Error).message}`);
      }
    } else {
      this.logger.warn('SMTP credentials not configured: emails are logged to the console (development only).');
    }
  }

  async sendOtpEmail(to: string, otp: string): Promise<boolean> {
    const subject = `Your Vendora Verification Code: ${otp}`;

    const html = `
      <div style="font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; padding: 0;">
        <div style="background-color: #0b1a4a; padding: 24px 32px; text-align: left;">
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
            Retail<span style="color: #ef4444;">POS</span>
          </h1>
          <p style="color: #93c5fd; font-size: 11px; margin: 4px 0 0 0; font-weight: 600;">Powered by Vendora</p>
        </div>

        <div style="padding: 32px;">
          <h2 style="font-size: 18px; font-weight: 800; color: #09090b; margin: 0 0 12px 0;">Verify your email address</h2>
          <p style="font-size: 14px; color: #52525b; line-height: 1.6; margin: 0 0 24px 0;">
            Thank you for registering your retail store on Vendora. Enter the verification code below to verify your email and complete your shop registration:
          </p>

          <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 6px; padding: 18px; text-align: center; margin: 0 0 24px 0;">
            <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #dc2626;">
              ${otp}
            </span>
          </div>

          <p style="font-size: 12px; color: #71717a; line-height: 1.5; margin: 0 0 16px 0;">
            ⏳ This code is valid for <strong>${OTP_TTL_MINUTES} minutes</strong>. If you did not request this verification, please safely disregard this email.
          </p>

          <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 24px 0;" />

          <p style="font-size: 11px; color: #a1a1aa; margin: 0; text-align: center;">
            © 2026 Vendora Cloud POS & ERP. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.deliver({ to, subject, html, devFallbackLog: `OTP for ${to}: ${otp}` });
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
    const subject = `Welcome to Vendora! Your Store Login Details 🚀`;

    const html = `
      <div style="font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; padding: 0;">
        <div style="background-color: #0b1a4a; padding: 28px 32px; text-align: left;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
            Retail<span style="color: #ef4444;">POS</span>
          </h1>
          <p style="color: #93c5fd; font-size: 11px; margin: 4px 0 0 0; font-weight: 600;">Powered by Vendora</p>
        </div>

        <div style="padding: 32px;">
          <h2 style="font-size: 20px; font-weight: 800; color: #09090b; margin: 0 0 8px 0;">
            Welcome to Vendora, ${payload.ownerName}! 🎉
          </h2>
          <p style="font-size: 14px; color: #52525b; line-height: 1.6; margin: 0 0 24px 0;">
            Your cloud retail store instance for <strong>${payload.businessName}</strong> has been provisioned and is ready for billing.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 0 0 28px 0;">
            <h3 style="font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              Store Login Credentials
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 500; width: 140px;">Customer / Shop ID:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700; font-family: monospace; font-size: 14px;">${payload.shopId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Admin Username:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: 700; font-family: monospace; font-size: 14px;">${payload.username}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Temporary Password:</td>
                <td style="padding: 6px 0; color: #dc2626; font-weight: 700; font-family: monospace; font-size: 14px; background-color: #fef2f2; padding: 4px 8px; border-radius: 4px; border: 1px solid #fee2e2;">
                  ${payload.temporaryPassword}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Store Terminal:</td>
                <td style="padding: 6px 0; color: #2563eb; font-weight: 600;">${payload.shopUrl}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 0 0 28px 0;">
            <a href="${payload.shopUrl}" target="_blank" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 32px; border-radius: 6px;">
              Open Store Counter →
            </a>
          </div>

          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 14px; margin: 0 0 24px 0;">
            <p style="font-size: 12px; color: #b91c1c; margin: 0; line-height: 1.5;">
              ⚠️ <strong>Security Requirement:</strong> You will be prompted to reset your temporary password immediately upon your first login to ensure full account privacy.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 24px 0;" />

          <p style="font-size: 11px; color: #a1a1aa; margin: 0; text-align: center;">
            © 2026 Vendora Cloud POS & ERP • Powered by Vendora
          </p>
        </div>
      </div>
    `;

    return this.deliver({
      to: payload.to,
      subject,
      html,
      devFallbackLog: `Welcome email for ${payload.to} | shop ${payload.shopId} | user ${payload.username} | temp password ${payload.temporaryPassword} | ${payload.shopUrl}`,
    });
  }

  async sendPasswordResetEmail(payload: {
    to: string;
    fullName: string;
    businessName: string;
    shopId: string;
    resetUrl: string;
  }): Promise<boolean> {
    const subject = 'Reset your Vendora password';
    const fullName = StringUtil.escapeHtml(payload.fullName);
    const businessName = StringUtil.escapeHtml(payload.businessName);
    const shopId = StringUtil.escapeHtml(payload.shopId);
    const resetUrl = StringUtil.escapeHtml(payload.resetUrl);

    const html = `
      <div style="font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; padding: 0;">
        <div style="background-color: #0b1a4a; padding: 24px 32px; text-align: left;">
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
            Retail<span style="color: #ef4444;">POS</span>
          </h1>
          <p style="color: #93c5fd; font-size: 11px; margin: 4px 0 0 0; font-weight: 600;">Powered by Vendora</p>
        </div>

        <div style="padding: 32px;">
          <h2 style="font-size: 18px; font-weight: 800; color: #09090b; margin: 0 0 12px 0;">Reset your password</h2>
          <p style="font-size: 14px; color: #52525b; line-height: 1.6; margin: 0 0 24px 0;">
            Hi ${fullName}, we received a request to reset the password for your account at
            <strong>${businessName}</strong> (Shop ID <span style="font-family: monospace;">${shopId}</span>).
            Use the button below to choose a new password.
          </p>

          <div style="text-align: center; margin: 0 0 24px 0;">
            <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 32px; border-radius: 6px;">
              Choose a new password
            </a>
          </div>

          <p style="font-size: 12px; color: #71717a; line-height: 1.5; margin: 0 0 8px 0;">
            Or paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #2563eb; line-height: 1.5; margin: 0 0 24px 0; word-break: break-all;">
            ${resetUrl}
          </p>

          <p style="font-size: 12px; color: #71717a; line-height: 1.5; margin: 0 0 16px 0;">
            ⏳ This link is valid for <strong>${PASSWORD_RESET_TTL_MINUTES} minutes</strong> and can be used once. Resetting your password signs you out on other devices.
            If you did not request a reset, you can ignore this email; your password will not change.
          </p>

          <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 24px 0;" />

          <p style="font-size: 11px; color: #a1a1aa; margin: 0; text-align: center;">
            © 2026 Vendora Cloud POS & ERP. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.deliver({
      to: payload.to,
      subject,
      html,
      devFallbackLog: `Password reset for ${payload.to} | shop ${payload.shopId} | ${payload.resetUrl}`,
    });
  }

  /** True when real SMTP delivery is configured. */
  get isConfigured(): boolean {
    return this.transporter !== null;
  }

  /**
   * Single delivery path for every email. Without SMTP (local dev) the content
   * is logged instead — never in production, and never when SMTP is configured,
   * so OTPs and passwords don't end up in production logs.
   */
  private async deliver(mail: { to: string; subject: string; html: string; devFallbackLog: string }): Promise<boolean> {
    if (!this.transporter) {
      if (this.configService.get<string>('NODE_ENV') === 'production') {
        this.logger.error(`SMTP is not configured; email "${mail.subject.replace(/\d{6}/, '******')}" to ${StringUtil.maskEmail(mail.to)} was not sent.`);
        return false;
      }
      this.logger.warn(`[DEV EMAIL - SMTP not configured] ${mail.devFallbackLog}`);
      return true;
    }

    try {
      await this.transporter.sendMail({ from: this.fromAddress, to: mail.to, subject: mail.subject, html: mail.html });
      this.logger.log(`Email "${mail.subject.replace(/\d{6}/, '******')}" delivered to ${StringUtil.maskEmail(mail.to)}`);
      return true;
    } catch (err) {
      this.logger.error(`SMTP delivery to ${StringUtil.maskEmail(mail.to)} failed: ${(err as Error).message}`);
      return false;
    }
  }

  private get fromAddress(): string {
    return this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('SMTP_FROM') || 'Vendora POS';
  }
}
