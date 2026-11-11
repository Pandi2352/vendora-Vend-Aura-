import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common';

@ApiTags('System & Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Vendora API System Health & Status' })
  getHealth() {
    return this.appService.getSystemStatus();
  }

  @Public()
  @Get('health/liveness')
  @ApiOperation({ summary: 'Container Liveness Probe' })
  getLiveness() {
    return this.appService.getLiveness();
  }

  @Public()
  @Get('health/readiness')
  @ApiOperation({ summary: 'Container Readiness Probe with Database check' })
  getReadiness() {
    return this.appService.getReadiness();
  }
}
