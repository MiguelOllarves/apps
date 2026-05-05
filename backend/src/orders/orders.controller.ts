import { Controller, Post, Body, Headers, Get, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, CreatePublicOrderDto } from './dto/orders.dto';
import { Public } from '../auth/public.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(tenantId, dto);
  }

  @Post(':id/ship')
  confirmShipment(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.shipOrder(tenantId, orderId);
  }

  @Public()
  @Post('public')
  createPublicOrder(
    @Headers('x-tenant-id') headerTenantId: string,
    @Body() dto: CreatePublicOrderDto,
  ) {
    const tenantId = headerTenantId || dto.tenantId;
    return this.ordersService.createPublicOrder(tenantId!, dto);
  }

  @Get('metrics')
  getMetrics(@Headers('x-tenant-id') tenantId: string) {
    return this.ordersService.getMetrics(tenantId);
  }

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.findAll(tenantId, limit);
  }

  @Get('customer/:userId')
  getCustomerHistory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('userId') userId: string,
  ) {
    return this.ordersService.getCustomerHistory(tenantId, userId);
  }
}
