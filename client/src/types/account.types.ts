export interface UsageMeter {
  used: number;
  limit: number;
}

export interface AccountOverview {
  store: {
    shopId: string;
    businessName: string;
    businessType: string;
    ownerName: string;
    email: string;
    phone: string;
    gstin: string | null;
    address: { street?: string; city?: string; state?: string; pincode?: string; country?: string } | null;
    status: string;
    timezone?: string;
    currency?: string;
  };
  terminal: {
    outletName: string;
    outletCode: string;
    isPrimaryOutlet: boolean;
    username: string;
    role: string;
  };
  plan: {
    code: string;
    name: string;
    status: string;
    isTrial: boolean;
    startsAt: string | null;
    expiresAt: string | null;
  };
  usage: {
    users: UsageMeter;
    outlets: UsageMeter;
    billsThisMonth: UsageMeter;
  };
}
