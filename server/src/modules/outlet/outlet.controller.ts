import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OutletService } from './outlet.service';
import { StockTransferService, StockTransferView } from './stock-transfer.service';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { CreateStockTransferDto } from './dto/create-transfer.dto';
import { TenantId, CurrentUser } from '../../common';
import { UserRole } from '../../shared';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Outlets & Multi-Branch Management')
@ApiBearerAuth()
@Controller('outlets')
export class OutletController {
  constructor(
    private readonly outletService: OutletService,
    private readonly transferService: StockTransferService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all store outlets/branches' })
  listOutlets(@TenantId() tenantId: string) {
    return this.outletService.listOutlets(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new outlet/branch (enforces plan maxOutlets limit)' })
  @Roles(UserRole.OWNER, UserRole.STORE_MANAGER)
  createOutlet(@TenantId() tenantId: string, @Body() dto: CreateOutletDto) {
    return this.outletService.createOutlet(tenantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branch information' })
  @Roles(UserRole.OWNER, UserRole.STORE_MANAGER)
  updateOutlet(
    @TenantId() tenantId: string,
    @Param('id') outletId: string,
    @Body() dto: Partial<CreateOutletDto>,
  ) {
    return this.outletService.updateOutlet(tenantId, outletId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete/deactivate branch location' })
  @Roles(UserRole.OWNER, UserRole.STORE_MANAGER)
  deleteOutlet(@TenantId() tenantId: string, @Param('id') outletId: string) {
    return this.outletService.deleteOutlet(tenantId, outletId);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'List inter-store stock transfers (STN)' })
  listTransfers(@TenantId() tenantId: string): Promise<StockTransferView[]> {
    return this.transferService.listTransfers(tenantId);
  }

  @Post('transfers')
  @ApiOperation({ summary: 'Dispatch stock transfer from one branch to another' })
  @Roles(UserRole.OWNER, UserRole.STORE_MANAGER)
  createTransfer(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateStockTransferDto,
  ) {
    return this.transferService.createTransfer(tenantId, userId, dto);
  }

  @Patch('transfers/:id/receive')
  @ApiOperation({ summary: 'Acknowledge and receive stock at destination branch' })
  @Roles(UserRole.OWNER, UserRole.STORE_MANAGER, UserRole.CASHIER)
  receiveTransfer(@TenantId() tenantId: string, @Param('id') transferId: string) {
    return this.transferService.receiveTransfer(tenantId, transferId);
  }
}
