import { Controller, Post, Get, Body, Req, Headers, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout.dto';
import { Public, TenantId } from '../../common';

@ApiTags('Payments & Subscriptions')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Get public Stripe configuration (publishable key)' })
  getConfig() {
    return this.paymentService.getPublicConfig();
  }

  @Public()
  @Get('verify-session')
  @ApiOperation({ summary: 'Verify Stripe checkout session completion and immediately activate plan' })
  @ApiQuery({ name: 'sessionId', required: true, description: 'Stripe checkout session ID (cs_...)' })
  async verifySession(@Query('sessionId') sessionId: string) {
    return this.paymentService.verifySession(sessionId);
  }

  @ApiBearerAuth()
  @Get('invoices')
  @ApiOperation({ summary: 'List past subscription payment invoices and receipts' })
  async getInvoices(@TenantId() tenantId: string) {
    return this.paymentService.getInvoices(tenantId);
  }

  @ApiBearerAuth()
  @Post('checkout-session')
  @ApiOperation({ summary: 'Create Stripe Checkout Session to purchase or upgrade tenant subscription plan' })
  async createCheckoutSession(
    @TenantId() tenantId: string,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.paymentService.createPlanCheckoutSession(tenantId, dto);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe Webhook listener for payment events' })
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody || req.body;
    if (!rawBody) {
      throw new BadRequestException('Missing raw request payload for webhook signature verification.');
    }

    return this.paymentService.handleWebhook(rawBody, signature);
  }
}

