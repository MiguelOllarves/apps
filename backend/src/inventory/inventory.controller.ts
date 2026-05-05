import { Controller, Post, Body, Headers, Get, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { RecordTransactionDto } from './dto/inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('transaction')
  recordTransaction(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: RecordTransactionDto,
  ) {
    return this.inventoryService.recordTransaction(tenantId, dto);
  }

  @Get('critical')
  getCriticalStock(@Headers('x-tenant-id') tenantId: string) {
    return this.inventoryService.getCriticalStock(tenantId);
  }

  @Get('transactions')
  getTransactionHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Query('rawMaterialId') rawMaterialId?: string,
  ) {
    return this.inventoryService.getTransactionHistory(tenantId, rawMaterialId);
  }
}
