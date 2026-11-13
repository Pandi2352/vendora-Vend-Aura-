import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../common';
import { WarehouseService } from './services/warehouse.service';
import { TerritoryService } from './services/territory.service';
import { ReasonService } from './services/reason.service';
import { ParamService } from './services/param.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';
import { CreateTerritoryDto, UpdateTerritoryDto } from './dto/territory.dto';
import { CreateReasonDto, UpdateReasonDto } from './dto/reason.dto';
import { CreateParamDto, UpdateParamDto } from './dto/param.dto';

@ApiTags('Master Data')
@ApiBearerAuth()
@Controller('master')
export class MasterController {
  constructor(
    private readonly warehouseService: WarehouseService,
    private readonly territoryService: TerritoryService,
    private readonly reasonService: ReasonService,
    private readonly paramService: ParamService,
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
  updateWarehouse(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
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
  updateTerritory(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTerritoryDto,
  ) {
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
  updateReason(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateReasonDto,
  ) {
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
  updateParam(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateParamDto,
  ) {
    return this.paramService.update(tenantId, id, dto);
  }

  @Delete('params/:id')
  @ApiOperation({ summary: 'Delete a store parameter' })
  removeParam(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.paramService.remove(tenantId, id);
  }
}
