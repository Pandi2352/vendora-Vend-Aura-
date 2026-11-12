import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { SyncOfflineOrdersDto } from './dto/sync-offline.dto';
import { AuthenticatedUser } from '../../common';

export interface SyncResult {
  synced: Array<{
    offlineRef?: string;
    invoiceNumber: string;
    grandTotal: number;
    paymentMode: string;
  }>;
  failed: Array<{
    offlineRef?: string;
    error: string;
  }>;
}

@Injectable()
export class OfflineSyncService {
  private readonly logger = new Logger(OfflineSyncService.name);

  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Replays offline orders tendered at local counter when disconnected.
   * Processes sequentially to maintain invoice sequence order and handles idempotency.
   */
  async syncOfflineOrders(
    tenantId: string,
    dto: SyncOfflineOrdersDto,
    user: AuthenticatedUser,
  ): Promise<SyncResult> {
    const result: SyncResult = { synced: [], failed: [] };

    for (const orderDto of dto.orders) {
      try {
        const order = await this.ordersService.createOrder(tenantId, orderDto, user);
        result.synced.push({
          offlineRef: orderDto.offlineRef,
          invoiceNumber: order.invoiceNumber,
          grandTotal: order.grandTotal,
          paymentMode: order.paymentMode,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown sync failure';
        this.logger.error(`Offline sync failed for ref ${orderDto.offlineRef}: ${message}`);
        result.failed.push({
          offlineRef: orderDto.offlineRef,
          error: message,
        });
      }
    }

    this.logger.log(
      `Tenant ${tenantId} offline sync: ${result.synced.length} succeeded, ${result.failed.length} failed`,
    );
    return result;
  }
}

