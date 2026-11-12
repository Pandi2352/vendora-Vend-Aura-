export interface CheckoutSessionItem {
  name: string;
  description?: string;
  amount: number; // in smallest currency unit, e.g. paise / cents
  currency: string; // e.g. 'inr' or 'usd'
  quantity: number;
}

export interface CreateCheckoutSessionParams {
  customerId?: string;
  customerEmail?: string;
  items: CheckoutSessionItem[];
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
  mode?: 'payment' | 'subscription';
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface RetrievedCheckoutSession {
  sessionId: string;
  paymentStatus: string; // 'paid' | 'unpaid' | 'no_payment_required'
  status: string; // 'complete' | 'open' | 'expired'
  customerEmail?: string;
  metadata: Record<string, string>;
}

export interface WebhookEventResult {
  id: string;
  type: string;
  data: any;
  metadata?: Record<string, string>;
}

export interface PaymentGatewayProvider {
  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResult>;
  retrieveCheckoutSession(sessionId: string): Promise<RetrievedCheckoutSession>;
  constructWebhookEvent(rawBody: Buffer | string, signature: string): WebhookEventResult;
  createOrGetCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<string>;
}
