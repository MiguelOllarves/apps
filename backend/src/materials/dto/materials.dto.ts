import { IsString, IsNumber, IsEnum, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { UnitType } from '@prisma/client';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(UnitType)
  unit: UnitType;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  currentStock: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minStockAlert: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  baseCost: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  replacementCost: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  yieldPercentage: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  shrinkagePercentage: number;

  @IsString()
  @IsOptional()
  categoryId?: string;
}

export class UpdateMaterialDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(UnitType)
  @IsOptional()
  unit?: UnitType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  currentStock?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minStockAlert?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  baseCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  replacementCost?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  yieldPercentage?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  shrinkagePercentage?: number;

  @IsString()
  @IsOptional()
  categoryId?: string;
}
