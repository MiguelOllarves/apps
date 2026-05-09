import { Controller, Get, Patch, Body, Headers } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) { }

  @Get('settings')
  async getSettings(@Headers('x-tenant-id') tenantId: string) {
    return this.tenantsService.getSettings(tenantId);
  }

  @Patch('settings')
  async updateSettings(
    @Headers('x-tenant-id') tenantId: string,
    @Body() data: { name?: string; address?: string; logo?: string; bannerImage?: string; primaryColor?: string },
  ) {
    return this.tenantsService.updateSettings(tenantId, data);
  }
}
