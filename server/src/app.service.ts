import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DateUtil } from './common';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getSystemStatus() {
    const isDbConnected = this.connection.readyState === 1;
    return {
      status: isDbConnected ? 'healthy' : 'degraded',
      database: isDbConnected ? 'connected' : 'disconnected',
      product: 'Vendora Cloud Retail POS & ERP',
      tagline: 'One platform. Every retail operation.',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: DateUtil.toIso(),
    };
  }

  getLiveness() {
    return {
      status: 'up',
      timestamp: DateUtil.toIso(),
    };
  }

  getReadiness() {
    const isDbConnected = this.connection.readyState === 1;
    return {
      status: isDbConnected ? 'ready' : 'not_ready',
      database: isDbConnected ? 'connected' : 'disconnected',
      timestamp: DateUtil.toIso(),
    };
  }
}
