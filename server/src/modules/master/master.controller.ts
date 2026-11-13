import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../common';
import { WarehouseService } from './services/warehouse.service';
import { TerritoryService } from './services/territory.service';
import { ReasonService } from './services/reason.service';
import { ParamService } from './services/param.service';
import { TransporterService } from './services/transporter.service';
import { FreightService } from './services/freight.service';
import { BarcodeTemplateService } from './services/barcode-template.service';
import { PickerService } from './services/picker.service';
import { VoucherService } from './services/voucher.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';
import { CreateTerritoryDto, UpdateTerritoryDto } from './dto/territory.dto';
import { CreateReasonDto, UpdateReasonDto } from './dto/reason.dto';
import { CreateParamDto, UpdateParamDto } from './dto/param.dto';
import { CreateTransporterDto, UpdateTransporterDto } from './dto/transporter.dto';
import { CreateFreightDto, UpdateFreightDto } from './dto/freight.dto';
import { CreateBarcodeTemplateDto, UpdateBarcodeTemplateDto } from './dto/barcode-template.dto';
import { CreatePickerDto, UpdatePickerDto } from './dto/picker.dto';
import { CreateVoucherDto, UpdateVoucherDto } from './dto/voucher.dto';

@ApiTags('Master Data')
@ApiBearerAuth()
@Controller('master')
export class MasterController {
  constructor(
    private readonly warehouseService: WarehouseService,
    private readonly territoryService: TerritoryService,
    private readonly reasonService: ReasonService,
    private readonly paramService: ParamService,
    private readonly transporterService: TransporterService,
    private readonly freightService: FreightService,
    private readonly barcodeService: BarcodeTemplateService,
    private readonly pickerService: PickerService,
    private readonly voucherService: VoucherService,
  ) {}

  // --- Warehouses ---
  @Get('warehouses')
  @ApiOperation({ summary: 'List all warehouses' })
  listWarehouses(@TenantId() tenantId: string) {
    return this.warehouseService.list(tenantId);
  }

  @Post('warehouses')
  @ApiOperation({ summary: 'Create a warehouse' })
  createWarehouse(@TenantId() tenantId: string, @Body() dto: CreateWarehouseDto) {
    return this.warehouseService.create(tenantId, dto);
  }

  @Patch('warehouses/:id')
  @ApiOperation({ summary: 'Update a warehouse' })
  updateWarehouse(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehouseService.update(tenantId, id, dto);
  }

  @Delete('warehouses/:id')
  @ApiOperation({ summary: 'Delete a warehouse' })
  removeWarehouse(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.warehouseService.remove(tenantId, id);
  }

  // --- Territories ---
  @Get('territories')
  @ApiOperation({ summary: 'List all territories' })
  listTerritories(@TenantId() tenantId: string) {
    return this.territoryService.list(tenantId);
  }

  @Post('territories')
  @ApiOperation({ summary: 'Create a territory' })
  createTerritory(@TenantId() tenantId: string, @Body() dto: CreateTerritoryDto) {
    return this.territoryService.create(tenantId, dto);
  }

  @Patch('territories/:id')
  @ApiOperation({ summary: 'Update a territory' })
  updateTerritory(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateTerritoryDto) {
    return this.territoryService.update(tenantId, id, dto);
  }

  @Delete('territories/:id')
  @ApiOperation({ summary: 'Delete a territory' })
  removeTerritory(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.territoryService.remove(tenantId, id);
  }

  // --- Reasons ---
  @Get('reasons')
  @ApiOperation({ summary: 'List all reasons' })
  listReasons(@TenantId() tenantId: string) {
    return this.reasonService.list(tenantId);
  }

  @Post('reasons')
  @ApiOperation({ summary: 'Create a reason' })
  createReason(@TenantId() tenantId: string, @Body() dto: CreateReasonDto) {
    return this.reasonService.create(tenantId, dto);
  }

  @Patch('reasons/:id')
  @ApiOperation({ summary: 'Update a reason' })
  updateReason(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateReasonDto) {
    return this.reasonService.update(tenantId, id, dto);
  }

  @Delete('reasons/:id')
  @ApiOperation({ summary: 'Delete a reason' })
  removeReason(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.reasonService.remove(tenantId, id);
  }

  // --- Parameters ---
  @Get('params')
  @ApiOperation({ summary: 'List all store parameters' })
  listParams(@TenantId() tenantId: string) {
    return this.paramService.list(tenantId);
  }

  @Post('params')
  @ApiOperation({ summary: 'Create a store parameter' })
  createParam(@TenantId() tenantId: string, @Body() dto: CreateParamDto) {
    return this.paramService.create(tenantId, dto);
  }

  @Patch('params/:id')
  @ApiOperation({ summary: 'Update a store parameter' })
  updateParam(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateParamDto) {
    return this.paramService.update(tenantId, id, dto);
  }

  @Delete('params/:id')
  @ApiOperation({ summary: 'Delete a store parameter' })
  removeParam(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.paramService.remove(tenantId, id);
  }

  // --- Transporters ---
  @Get('transporters')
  @ApiOperation({ summary: 'List all transporters' })
  listTransporters(@TenantId() tenantId: string) {
    return this.transporterService.list(tenantId);
  }

  @Post('transporters')
  @ApiOperation({ summary: 'Create a transporter' })
  createTransporter(@TenantId() tenantId: string, @Body() dto: CreateTransporterDto) {
    return this.transporterService.create(tenantId, dto);
  }

  @Patch('transporters/:id')
  @ApiOperation({ summary: 'Update a transporter' })
  updateTransporter(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateTransporterDto) {
    return this.transporterService.update(tenantId, id, dto);
  }

  @Delete('transporters/:id')
  @ApiOperation({ summary: 'Delete a transporter' })
  removeTransporter(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.transporterService.remove(tenantId, id);
  }

  // --- Freight Charges ---
  @Get('freight')
  @ApiOperation({ summary: 'List all freight charges' })
  listFreight(@TenantId() tenantId: string) {
    return this.freightService.list(tenantId);
  }

  @Post('freight')
  @ApiOperation({ summary: 'Create a freight charge rule' })
  createFreight(@TenantId() tenantId: string, @Body() dto: CreateFreightDto) {
    return this.freightService.create(tenantId, dto);
  }

  @Patch('freight/:id')
  @ApiOperation({ summary: 'Update a freight charge rule' })
  updateFreight(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateFreightDto) {
    return this.freightService.update(tenantId, id, dto);
  }

  @Delete('freight/:id')
  @ApiOperation({ summary: 'Delete a freight charge rule' })
  removeFreight(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.freightService.remove(tenantId, id);
  }

  // --- Barcode Templates ---
  @Get('barcode-templates')
  @ApiOperation({ summary: 'List all barcode printer label templates' })
  listBarcodeTemplates(@TenantId() tenantId: string) {
    return this.barcodeService.list(tenantId);
  }

  @Post('barcode-templates')
  @ApiOperation({ summary: 'Create a barcode printer label template' })
  createBarcodeTemplate(@TenantId() tenantId: string, @Body() dto: CreateBarcodeTemplateDto) {
    return this.barcodeService.create(tenantId, dto);
  }

  @Patch('barcode-templates/:id')
  @ApiOperation({ summary: 'Update a barcode printer label template' })
  updateBarcodeTemplate(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateBarcodeTemplateDto) {
    return this.barcodeService.update(tenantId, id, dto);
  }

  @Delete('barcode-templates/:id')
  @ApiOperation({ summary: 'Delete a barcode printer label template' })
  removeBarcodeTemplate(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.barcodeService.remove(tenantId, id);
  }

  // --- Pickers ---
  @Get('pickers')
  @ApiOperation({ summary: 'List all fulfillment and store pickers' })
  listPickers(@TenantId() tenantId: string) {
    return this.pickerService.list(tenantId);
  }

  @Post('pickers')
  @ApiOperation({ summary: 'Register a store picker' })
  createPicker(@TenantId() tenantId: string, @Body() dto: CreatePickerDto) {
    return this.pickerService.create(tenantId, dto);
  }

  @Patch('pickers/:id')
  @ApiOperation({ summary: 'Update a store picker' })
  updatePicker(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdatePickerDto) {
    return this.pickerService.update(tenantId, id, dto);
  }

  @Delete('pickers/:id')
  @ApiOperation({ summary: 'Delete a store picker' })
  removePicker(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.pickerService.remove(tenantId, id);
  }

  // --- Vouchers ---
  @Get('vouchers')
  @ApiOperation({ summary: 'List all gift vouchers and promotional coupons' })
  listVouchers(@TenantId() tenantId: string) {
    return this.voucherService.list(tenantId);
  }

  @Post('vouchers')
  @ApiOperation({ summary: 'Create a gift voucher' })
  createVoucher(@TenantId() tenantId: string, @Body() dto: CreateVoucherDto) {
    return this.voucherService.create(tenantId, dto);
  }

  @Patch('vouchers/:id')
  @ApiOperation({ summary: 'Update a gift voucher' })
  updateVoucher(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.voucherService.update(tenantId, id, dto);
  }

  @Delete('vouchers/:id')
  @ApiOperation({ summary: 'Delete a gift voucher' })
  removeVoucher(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.voucherService.remove(tenantId, id);
  }
}
