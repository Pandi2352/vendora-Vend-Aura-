import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, TenantId } from '../../common';
import { StockTransferService } from './stock-transfer.service';
import { CreateStockTransferDto, StockTransferQueryDto } from './dto/stock-transfer.dto';

@ApiTags('Inter-Branch Stock Transfers (STN)')
@ApiBearerAuth()
@Controller('inventory/transfers')
export class StockTransferController {
  constructor(private readonly transferService: StockTransferService) {}

  @Get()
  @ApiOperation({ summary: 'List all inter-branch stock transfers' })
  async listTransfers(
    @TenantId() tenantId: string,
    @Query() query: StockTransferQueryDto,
  ) {
    return this.transferService.listTransfers(tenantId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new stock transfer request' })
  async createTransfer(
    @TenantId() tenantId: string,
    @Body() dto: CreateStockTransferDto,
    @CurrentUser('fullName') user: string,
  ) {
    const data = await this.transferService.createTransfer(tenantId, dto, user || 'Staff');
    return { message: 'Stock transfer request created', data };
  }

  @Post(':id/dispatch')
  @ApiOperation({ summary: 'Dispatch stock transfer from source outlet' })
  async dispatchTransfer(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('fullName') user: string,
  ) {
    const data = await this.transferService.dispatchTransfer(tenantId, id, user || 'Staff');
    return { message: `Stock transfer ${data.transferNumber} dispatched`, data };
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'Receive stock transfer at destination outlet' })
  async receiveTransfer(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser('fullName') user: string,
  ) {
    const data = await this.transferService.receiveTransfer(tenantId, id, user || 'Staff');
    return { message: `Stock transfer ${data.transferNumber} received and stock updated`, data };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel stock transfer' })
  async cancelTransfer(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    const data = await this.transferService.cancelTransfer(tenantId, id);
    return { message: `Stock transfer ${data.transferNumber} cancelled`, data };
  }
}
