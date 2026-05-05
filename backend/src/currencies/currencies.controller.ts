import { Controller, Get, Post, Patch, Body, Param, Headers } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.currenciesService.findAll(tenantId);
  }

  @Get('rates')
  getRates(@Headers('x-tenant-id') tenantId: string) {
    return this.currenciesService.getRates(tenantId);
  }

  @Post('sync')
  syncRates(@Headers('x-tenant-id') tenantId: string) {
    return this.currenciesService.syncExternalRates(tenantId);
  }

  @Patch(':id/rate')
  updateRate(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body('exchangeRate') rate: number,
  ) {
    return this.currenciesService.updateRate(tenantId, id, rate);
  }
}
