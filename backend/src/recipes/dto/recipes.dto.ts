import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeIngredientDto {
  @IsString()
  @IsNotEmpty()
  rawMaterialId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  unit: string;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  currencyId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  @IsOptional()
  ingredients?: RecipeIngredientDto[];

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
