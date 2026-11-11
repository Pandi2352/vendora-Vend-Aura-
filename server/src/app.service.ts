import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getSystemStatus() {
    return {
      status: 'online',
      product: 'Vendora Cloud Retail POS & ERP',
      tagline: 'One platform. Every retail operation.',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}

