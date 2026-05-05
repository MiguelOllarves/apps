import { Controller, Get, Post, Headers, Query, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Public } from '../auth/public.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('metrics')
  async getMetrics(
    @Headers('x-tenant-id') tenantId: string,
    @Query('range') range: string
  ) {
    return this.dashboardService.getMetrics(tenantId, range);
  }

  @Public()
  @Get('public-menu/:slug')
  async getPublicMenu(@Param('slug') slug: string) {
    return this.dashboardService.getPublicMenu(slug);
  }

  @Post('purge')
  purgeData(@Headers('x-tenant-id') tenantId: string) {
    return this.dashboardService.purgeData(tenantId);
  }
}
