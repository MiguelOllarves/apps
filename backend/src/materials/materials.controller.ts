import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/materials.dto';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateMaterialDto,
  ) {
    return this.materialsService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.materialsService.findAll(tenantId, categoryId);
  }

  @Get(':id')
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.materialsService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.materialsService.remove(tenantId, id);
  }
}
