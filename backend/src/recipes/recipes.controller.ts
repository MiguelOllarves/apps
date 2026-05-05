import { Controller, Get, Param, Headers, Post, Body, Patch, Delete } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/recipes.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) { }

  @Get()
  findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.recipesService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.recipesService.findOne(tenantId, id);
  }

  @Post(':id/calculate-cost')
  calculateCost(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.recipesService.calculateCost(tenantId, id);
  }

  @Post(':id/consume')
  consumeRecipe(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.recipesService.consumeRecipeIngredients(tenantId, id, 1);
  }

  @Post()
  create(@Headers('x-tenant-id') tenantId: string, @Body() dto: CreateRecipeDto) {
    return this.recipesService.create(tenantId, dto);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateRecipeDto>,
  ) {
    return this.recipesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.recipesService.remove(tenantId, id);
  }
}
