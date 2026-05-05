import { Controller, Get, Param, Headers, Post, Patch, Body, Delete } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../auth/dto/auth.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.customersService.findAll(tenantId);
  }

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create(tenantId, dto);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.remove(tenantId, id);
  }

  @Get(':id/metrics')
  getMetrics(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.getMetrics(tenantId, id);
  }
}
